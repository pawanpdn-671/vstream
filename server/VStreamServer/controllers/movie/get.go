package movie

import (
	"context"
	"errors"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/database"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/models"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/utils"
	"github.com/tmc/langchaingo/llms/openai"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func GetMovies(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c, 100*time.Second)
		defer cancel()

		var movieCollection *mongo.Collection = database.OpenCollection("movies", client)

		// Parse query parameters
		page, err1 := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, err2 := strconv.Atoi(c.DefaultQuery("limit", "10"))

		if err1 != nil || err2 != nil || page < 1 || limit < 1 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pagination parameters"})
			return
		}

		skip := (page - 1) * limit
		search := c.Query("search")
		genre := c.Query("genre")
		filter := bson.M{}

		if search != "" {
			filter["title"] = bson.M{
				"$regex":   regexp.QuoteMeta(search),
				"$options": "i",
			}
		}

		if genre != "" {
			filter["genre.genre_name"] = bson.M{
				"$regex":   regexp.QuoteMeta(genre),
				"$options": "i",
			}
		}

		// MongoDB find options for pagination
		findOptions := options.Find()
		findOptions.SetSkip(int64(skip))
		findOptions.SetLimit(int64(limit))

		// Fetch data
		cursor, err := movieCollection.Find(ctx, filter, findOptions)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":  fmt.Sprintf("Failed to fetch movies: %v", err),
				"filter": filter,
			})
			return
		}
		defer cursor.Close(ctx)

		var movies []models.Movie
		if err = cursor.All(ctx, &movies); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode movies"})
			return
		}

		// count total documents to send pagination info
		total, _ := movieCollection.CountDocuments(ctx, filter)

		c.JSON(http.StatusOK, gin.H{
			"page":       page,
			"total":      total,
			"totalPages": int(math.Ceil(float64(total) / float64(limit))),
			"data":       movies,
		})
	}
}

func GetMovie(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c, 100*time.Second)
		defer cancel()

		movieID := c.Param("imdb_id")

		if movieID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "movie id is required!"})
		}

		var movie models.Movie

		var movieCollection *mongo.Collection = database.OpenCollection("movies", client)
		err := movieCollection.FindOne(ctx, bson.M{"imdb_id": movieID}).Decode(&movie)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "movie not found!"})
			return
		}

		c.JSON(http.StatusOK, movie)

	}
}

func GetReviewRanking(admin_review string, client *mongo.Client, c *gin.Context) (string, int, error) {
	rankings, err := getRankings(client, c)

	if err != nil {
		return "", 0, err
	}

	sentimentDelimited := ""

	for _, ranking := range rankings {
		if ranking.RankingValue != 999 {
			sentimentDelimited = sentimentDelimited + ranking.RankingName + ","
		}
	}

	sentimentDelimited = strings.Trim(sentimentDelimited, ",")

	err = godotenv.Load(".env")

	if err != nil {
		log.Println("Warning: .env file is missing")
	}

	groqApiKey := os.Getenv("GROQ_API_KEY")
	if groqApiKey == "" {
		return "", 0, errors.New("could not read api key")
	}

	llm, err := openai.New(
		openai.WithToken(groqApiKey),
		openai.WithBaseURL("https://api.groq.com/openai/v1"),
		openai.WithModel("llama-3.3-70b-versatile"),
	)

	if err != nil {
		return "", 0, err
	}

	base_prompt_template := os.Getenv("BASE_PROMPT_TEMPLATE")

	base_prompt := strings.Replace(base_prompt_template, "{rankings}", sentimentDelimited, 1)

	response, err := llm.Call(c, base_prompt+admin_review)

	if err != nil {
		return "", 0, err
	}
	rankVal := 0

	for _, ranking := range rankings {
		if ranking.RankingName == response {
			rankVal = ranking.RankingValue
			break
		}
	}

	return response, rankVal, nil
}

func getRankings(client *mongo.Client, c *gin.Context) ([]models.Ranking, error) {
	var rankings []models.Ranking

	var ctx, cancel = context.WithTimeout(c, 100*time.Second)
	defer cancel()

	var rankingCollection *mongo.Collection = database.OpenCollection("rankings", client)
	cursor, err := rankingCollection.Find(ctx, bson.M{})

	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err := cursor.All(ctx, &rankings); err != nil {
		return nil, err
	}

	return rankings, nil
}

func GetRecommendedMovies(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		userId, err := utils.GetUserIdFromContext(c)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		favourite_genres, err := GetUsersFavouriteGenres(userId, client, c)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		err = godotenv.Load(".env")
		if err != nil {
			log.Println("Warning: .env file is missing!")
		}

		var recommendedMovieLimitVal int64 = 5
		var recommendedMovieLimit = os.Getenv("RECOMMENDED_MOVIE_LIMIT")

		if recommendedMovieLimit != "" {
			recommendedMovieLimitVal, _ = strconv.ParseInt(recommendedMovieLimit, 10, 64)
		}

		findOptions := options.Find()
		findOptions.SetSort(bson.D{{Key: "ranking.ranking_value", Value: 1}})
		findOptions.SetLimit(recommendedMovieLimitVal)

		filter := bson.M{"genre.genre_name": bson.M{"$in": favourite_genres}}

		// Parse query parameters
		page, err1 := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, err2 := strconv.Atoi(c.DefaultQuery("limit", "10"))

		if err1 != nil || err2 != nil || page < 1 || limit < 1 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pagination parameters"})
			return
		}

		skip := (page - 1) * limit

		// MongoDB find options for pagination
		findOptions.SetSkip(int64(skip))
		findOptions.SetLimit(int64(limit))

		var ctx, cancel = context.WithTimeout(c, 100*time.Second)
		defer cancel()

		var movieCollection *mongo.Collection = database.OpenCollection("movies", client)
		cursor, err := movieCollection.Find(ctx, filter, findOptions)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching recommended movies"})
			return
		}

		defer cursor.Close(ctx)

		var recommendedMovies []models.Movie

		if err := cursor.All(ctx, &recommendedMovies); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		total, _ := movieCollection.CountDocuments(ctx, filter)

		c.JSON(http.StatusOK, gin.H{
			"page":       page,
			"total":      total,
			"totalPages": int(math.Ceil(float64(total) / float64(limit))),
			"data":       recommendedMovies,
		})
	}
}

func GetUsersFavouriteGenres(userId string, client *mongo.Client, c *gin.Context) ([]string, error) {
	var ctx, cancel = context.WithTimeout(c, 100*time.Second)
	defer cancel()

	filter := bson.M{"user_id": userId}

	projection := bson.M{
		"favourite_genres.genre_name": 1,
		"_id":                         0,
	}

	opts := options.FindOne().SetProjection(projection)
	var result bson.M

	var userCollection *mongo.Collection = database.OpenCollection("users", client)
	err := userCollection.FindOne(ctx, filter, opts).Decode(&result)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return []string{}, nil
		}
	}
	favGenresArray, ok := result["favourite_genres"].(bson.A)

	if !ok {
		return []string{}, errors.New("unable to retrieve favourite genres for user")
	}

	var genreNames []string

	for _, item := range favGenresArray {
		if genreMap, ok := item.(bson.D); ok {
			for _, elem := range genreMap {
				if elem.Key == "genre_name" {
					if name, ok := elem.Value.(string); ok {
						genreNames = append(genreNames, name)
					}
				}
			}
		}
	}

	return genreNames, nil
}

func GetGenres(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(c, 100*time.Second)
		defer cancel()

		var genreCollection *mongo.Collection = database.OpenCollection("genres", client)

		cursor, err := genreCollection.Find(ctx, bson.D{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching movie genres"})
			return
		}
		defer cursor.Close(ctx)

		var genres []models.Genre
		if err := cursor.All(ctx, &genres); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, genres)

	}
}

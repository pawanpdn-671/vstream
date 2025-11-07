package review

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"math/rand"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/database"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/models"
	"github.com/tmc/langchaingo/llms/openai"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func GetReviewsByMovie(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c, 100*time.Second)
		defer cancel()

		movieID := c.Param("imdb_id")
		if movieID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "movie id is required"})
			return
		}

		page, err1 := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, err2 := strconv.Atoi(c.DefaultQuery("limit", "10"))

		if err1 != nil || err2 != nil || page < 1 || limit < 1 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pagination parameters"})
			return
		}

		skip := (page - 1) * limit
		findOptions := options.Find()
		findOptions.SetSkip(int64(skip))
		findOptions.SetLimit(int64(limit))
		findOptions.SetSort(bson.M{"created_at": -1})

		movieCollection := database.OpenCollection("movies", client)
		reviewCollection := database.OpenCollection("reviews", client)

		// Fetch movie to get its ObjectID
		var movie models.Movie
		err := movieCollection.FindOne(ctx, bson.M{"imdb_id": movieID}).Decode(&movie)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "movie not found"})
			return
		}

		var reviews []models.Review
		cursor, err := reviewCollection.Find(ctx, bson.M{"movie_id": movie.ID}, findOptions)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error fetching reviews"})
			return
		}
		defer cursor.Close(ctx)

		if err = cursor.All(ctx, &reviews); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error decoding reviews"})
			return
		}

		total, _ := reviewCollection.CountDocuments(ctx, bson.M{"movie_id": movie.ID})

		c.JSON(http.StatusOK, gin.H{
			"page":       page,
			"totalPages": int(math.Ceil(float64(total) / float64(limit))),
			"total":      total,
			"data":       reviews,
		})

	}
}

func GetPopularWords(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c, 100*time.Second)
		defer cancel()

		movieID := c.Param("imdb_id")
		if movieID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "movie id is required"})
			return
		}

		movieCollection := database.OpenCollection("movies", client)
		reviewCollection := database.OpenCollection("reviews", client)

		// Fetch movie to get its ObjectID
		var movie models.Movie
		err := movieCollection.FindOne(ctx, bson.M{"imdb_id": movieID}).Decode(&movie)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "movie not found"})
			return
		}

		var reviews []models.Review
		cursor, err := reviewCollection.Find(ctx, bson.M{"movie_id": movie.ID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error fetching reviews"})
			return
		}
		defer cursor.Close(ctx)

		if err = cursor.All(ctx, &reviews); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error decoding reviews"})
			return
		}

		if len(reviews) > 50 {
			rand.Shuffle(len(reviews), func(i, j int) {
				reviews[i], reviews[j] = reviews[j], reviews[i]
			})
			reviews = reviews[:50]
		}

		groqAPIKey := os.Getenv("GROQ_API_KEY")
		if groqAPIKey == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "missing GROQ_API_KEY"})
			return
		}

		llm, err := openai.New(
			openai.WithToken(groqAPIKey),
			openai.WithBaseURL("https://api.groq.com/openai/v1"),
			openai.WithModel("llama-3.3-70b-versatile"),
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var combinedReviews strings.Builder
		for _, review := range reviews {
			combinedReviews.WriteString(fmt.Sprintf("- %s\n", review.Comment))
		}

		prompt := fmt.Sprintf(`
		You are a movie review analyzer.
		The following are user reviews for a movie.

		Analyze the text and return ONLY the 5 most frequently mentioned or semantically important words. Remember that these keywords will be for a movie, so don't include keywords like movie, etc. (nouns/adjectives that best represent what people talk about).

		Response output must be exactly in this format - no explanation, no markdown, no text before or after:
		{
		"popular_keywords": [string]
		}

		Reviews:
		%s
		`, combinedReviews.String())

		response, err := llm.Call(c, prompt)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		re := regexp.MustCompile(`\{[^}]+\}`)
		jsonMatch := re.FindString(response)

		if jsonMatch == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No valid JSON found in model response"})
			return
		}

		var parsed map[string]interface{}
		if err := json.Unmarshal([]byte(jsonMatch), &parsed); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON in model response"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"popular_words": parsed["popular_keywords"]})

	}
}

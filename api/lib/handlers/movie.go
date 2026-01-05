package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/pawanpdn-671/vstream/api/lib/database"
	"github.com/pawanpdn-671/vstream/api/lib/middleware"
	"github.com/pawanpdn-671/vstream/api/lib/models"
	"github.com/tmc/langchaingo/llms/openai"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// GetMovies returns paginated movies with optional search and genre filters
func GetMovies(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	movieCollection := database.OpenCollection("movies", client)

	// Parse query parameters
	page, err1 := strconv.Atoi(c.Query("page", "1"))
	limit, err2 := strconv.Atoi(c.Query("limit", "10"))

	if err1 != nil || err2 != nil || page < 1 || limit < 1 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid pagination parameters"})
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
		genres := strings.Split(genre, ",")
		regexes := make([]interface{}, 0, len(genres))
		for _, g := range genres {
			regexes = append(regexes, bson.Regex{
				Pattern: regexp.QuoteMeta(strings.TrimSpace(g)),
				Options: "i",
			})
		}
		filter["genre.genre_name"] = bson.M{"$in": regexes}
	}

	// MongoDB find options for pagination
	findOptions := options.Find()
	findOptions.SetSkip(int64(skip))
	findOptions.SetLimit(int64(limit))

	// Fetch data
	cursor, err := movieCollection.Find(ctx, filter, findOptions)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error":  fmt.Sprintf("Failed to fetch movies: %v", err),
			"filter": filter,
		})
	}
	defer cursor.Close(ctx)

	var movies []models.Movie
	if err = cursor.All(ctx, &movies); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to decode movies"})
	}

	// count total documents to send pagination info
	total, _ := movieCollection.CountDocuments(ctx, filter)

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"page":       page,
		"total":      total,
		"totalPages": int(math.Ceil(float64(total) / float64(limit))),
		"data":       movies,
	})
}

// GetMovie returns a single movie by IMDB ID
func GetMovie(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	movieID := c.Params("imdb_id")
	if movieID == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "movie id is required"})
	}

	movieCollection := database.OpenCollection("movies", client)

	var movie models.Movie
	err = movieCollection.FindOne(ctx, bson.M{"imdb_id": movieID}).Decode(&movie)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "movie not found"})
	}

	return c.Status(http.StatusOK).JSON(movie)
}

// GetGenres returns all available genres
func GetGenres(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	genreCollection := database.OpenCollection("genres", client)

	cursor, err := genreCollection.Find(ctx, bson.D{})
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error fetching movie genres"})
	}
	defer cursor.Close(ctx)

	var genres []models.Genre
	if err := cursor.All(ctx, &genres); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(http.StatusOK).JSON(genres)
}

// GetRecommendedMovies returns movies based on user's favorite genres
func GetRecommendedMovies(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	userId, ok := middleware.GetUserIdFromLocals(c)
	if !ok {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "User ID not found in context"})
	}

	favouriteGenres, err := getUsersFavouriteGenres(userId, client)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	findOptions := options.Find()
	filter := bson.M{"genre.genre_name": bson.M{"$in": favouriteGenres}}

	// Parse query parameters
	page, err1 := strconv.Atoi(c.Query("page", "1"))
	limit, err2 := strconv.Atoi(c.Query("limit", "10"))

	if err1 != nil || err2 != nil || page < 1 || limit < 1 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid pagination parameters"})
	}

	skip := (page - 1) * limit
	findOptions.SetSkip(int64(skip))
	findOptions.SetLimit(int64(limit))

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	movieCollection := database.OpenCollection("movies", client)
	cursor, err := movieCollection.Find(ctx, filter, findOptions)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error fetching recommended movies"})
	}
	defer cursor.Close(ctx)

	var recommendedMovies []models.Movie
	if err := cursor.All(ctx, &recommendedMovies); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	total, _ := movieCollection.CountDocuments(ctx, filter)

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"page":       page,
		"total":      total,
		"totalPages": int(math.Ceil(float64(total) / float64(limit))),
		"data":       recommendedMovies,
	})
}

// getUsersFavouriteGenres fetches user's favorite genres
func getUsersFavouriteGenres(userId string, client *mongo.Client) ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	filter := bson.M{"user_id": userId}
	projection := bson.M{
		"favourite_genres.genre_name": 1,
		"_id":                         0,
	}

	opts := options.FindOne().SetProjection(projection)
	var result bson.M

	userCollection := database.OpenCollection("users", client)
	err := userCollection.FindOne(ctx, filter, opts).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return []string{}, nil
		}
		return nil, err
	}

	favGenresArray, ok := result["favourite_genres"].(bson.A)
	if !ok {
		return []string{}, nil
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

// AddMovie adds a new movie
func AddMovie(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var movie models.Movie
	movieCollection := database.OpenCollection("movies", client)

	if err := c.BodyParser(&movie); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid input"})
	}

	if err := validate.Struct(movie); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error":   "validation failed",
			"details": err.Error(),
		})
	}

	var existingMovie models.Movie
	err = movieCollection.FindOne(ctx, bson.M{"imdb_id": movie.ImdbID}).Decode(&existingMovie)
	if err == nil {
		return c.Status(http.StatusConflict).JSON(fiber.Map{
			"error": "Movie already exists",
			"id":    existingMovie.ID,
		})
	} else if err != mongo.ErrNoDocuments {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to check existing movie"})
	}

	movie.CreatedAt = time.Now()
	movie.UpdatedAt = time.Now()

	result, err := movieCollection.InsertOne(ctx, movie)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to add movie"})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"message":     "Movie added successfully",
		"inserted_id": result.InsertedID,
	})
}

// UpdateMovie updates movie details
func UpdateMovie(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	movieID := c.Params("id")
	if movieID == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "movie ID is required"})
	}

	var updateData map[string]interface{}
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid input"})
	}

	// Remove _id if present
	delete(updateData, "_id")

	if len(updateData) == 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "no fields provided to update"})
	}

	updateData["updated_at"] = time.Now()

	movieCollection := database.OpenCollection("movies", client)

	filter := bson.M{"imdb_id": movieID}
	update := bson.M{"$set": updateData}

	opts := options.UpdateOne().SetUpsert(false)
	result, err := movieCollection.UpdateOne(ctx, filter, update, opts)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update movie"})
	}

	if result.MatchedCount == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "movie not found"})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"message": "Movie updated successfully"})
}

// DeleteMovie deletes a movie
func DeleteMovie(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	movieID := c.Params("id")
	if movieID == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "movie ID is required"})
	}

	movieCollection := database.OpenCollection("movies", client)
	filter := bson.M{"imdb_id": movieID}

	result, err := movieCollection.DeleteOne(ctx, filter)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to delete movie"})
	}

	if result.DeletedCount == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "movie not found"})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"message": "movie deleted successfully"})
}

// LikeOrDislikeMovie handles like/dislike actions on movies
func LikeOrDislikeMovie(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	imdbID := c.Params("imdb_id")
	action := c.Query("action") // "like" or "dislike"

	if imdbID == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "movie id is required"})
	}
	if action != "like" && action != "dislike" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid action, must be 'like' or 'dislike'"})
	}

	userId, ok := middleware.GetUserIdFromLocals(c)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "User not found or unauthorized."})
	}

	movieCollection := database.OpenCollection("movies", client)
	userCollection := database.OpenCollection("users", client)

	// Fetch movie
	var movie models.Movie
	err = movieCollection.FindOne(ctx, bson.M{"imdb_id": imdbID}).Decode(&movie)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "movie not found"})
	}

	// Fetch user
	var user models.User
	err = userCollection.FindOne(ctx, bson.M{"user_id": userId}).Decode(&user)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "user not found"})
	}

	userObjID, err := bson.ObjectIDFromHex(userId)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid user_id"})
	}

	movieID := movie.ID
	alreadyLiked := containsObjectID(movie.LikedBy, userObjID)
	alreadyDisliked := containsObjectID(movie.DislikedBy, userObjID)

	var movieUpdate bson.M
	var userUpdate bson.M
	var message string

	switch action {
	case "like":
		switch {
		case alreadyLiked:
			movieUpdate = bson.M{
				"$inc":  bson.M{"likes": -1},
				"$pull": bson.M{"liked_by": userObjID},
			}
			userUpdate = bson.M{
				"$pull": bson.M{"liked_movies": movieID},
			}
			message = "Movie unliked successfully"
		case alreadyDisliked:
			movieUpdate = bson.M{
				"$inc":  bson.M{"likes": 1, "dislikes": -1},
				"$pull": bson.M{"disliked_by": userObjID},
				"$push": bson.M{"liked_by": userObjID},
			}
			userUpdate = bson.M{
				"$pull": bson.M{"disliked_movies": movieID},
				"$push": bson.M{"liked_movies": movieID},
			}
			message = "Switched from dislike to like"
		default:
			movieUpdate = bson.M{
				"$inc":  bson.M{"likes": 1},
				"$push": bson.M{"liked_by": userObjID},
			}
			userUpdate = bson.M{
				"$push": bson.M{"liked_movies": movieID},
			}
			message = "Movie liked successfully"
		}
	case "dislike":
		switch {
		case alreadyDisliked:
			movieUpdate = bson.M{
				"$inc":  bson.M{"dislikes": -1},
				"$pull": bson.M{"disliked_by": userObjID},
			}
			userUpdate = bson.M{
				"$pull": bson.M{"disliked_movies": movieID},
			}
			message = "Dislike removed successfully"
		case alreadyLiked:
			movieUpdate = bson.M{
				"$inc":  bson.M{"likes": -1, "dislikes": 1},
				"$pull": bson.M{"liked_by": userObjID},
				"$push": bson.M{"disliked_by": userObjID},
			}
			userUpdate = bson.M{
				"$pull": bson.M{"liked_movies": movieID},
				"$push": bson.M{"disliked_movies": movieID},
			}
			message = "Switched from like to dislike"
		default:
			movieUpdate = bson.M{
				"$inc":  bson.M{"dislikes": 1},
				"$push": bson.M{"disliked_by": userObjID},
			}
			userUpdate = bson.M{
				"$push": bson.M{"disliked_movies": movieID},
			}
			message = "Movie disliked successfully"
		}
	}

	// Apply both updates
	if len(movieUpdate) > 0 {
		_, err = movieCollection.UpdateOne(ctx, bson.M{"_id": movie.ID}, movieUpdate)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update movie"})
		}
	}

	if len(userUpdate) > 0 {
		_, err = userCollection.UpdateOne(ctx, bson.M{"_id": user.ID}, userUpdate)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update user"})
		}
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"message": message})
}

// containsObjectID checks if a slice contains an ObjectID
func containsObjectID(arr []bson.ObjectID, id bson.ObjectID) bool {
	for _, a := range arr {
		if a == id {
			return true
		}
	}
	return false
}

// GenerateMovieFromStory generates movies based on user story using AI
func GenerateMovieFromStory(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	var req struct {
		Story     string `json:"story"`
		UserId    string `json:"user_id"`
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid request"})
	}

	// Read genres from embedded data or database
	genreJSON := getGenresJSON()

	groqApiKey := os.Getenv("GROQ_API_KEY")
	if groqApiKey == "" {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "api key is missing"})
	}

	llm, err := openai.New(
		openai.WithToken(groqApiKey),
		openai.WithBaseURL("https://api.groq.com/openai/v1"),
		openai.WithModel("llama-3.3-70b-versatile"),
	)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	basePromptTemplate := os.Getenv("GET_MOVIE_PROMPT_TEMPLATE")
	prompt := fmt.Sprintf(`%v
		Example:
		[
			{
			"title": "string",
			"plot": "string",
			"genre": "[{ genre_name: "string", genre_id: "int"}]"
			}
		]

		RULES:
		- Genres MUST ONLY come from this list.
		- genre_name and genre_id must match exactly.

		Allowed genres:
		%s
		
		User story:
		%s
		`, basePromptTemplate, genreJSON, req.Story)

	ctx := context.Background()
	response, err := llm.Call(ctx, prompt)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	re := regexp.MustCompile("(?s)```json(.*?)```")
	matches := re.FindStringSubmatch(response)
	clean := response
	if len(matches) > 1 {
		clean = matches[1]
	}
	clean = strings.TrimSpace(clean)

	var movies []map[string]interface{}
	if err := json.Unmarshal([]byte(clean), &movies); err != nil {
		return c.Status(http.StatusOK).JSON(fiber.Map{"raw": clean, "error": "failed to parse JSON"})
	}

	// Rate limiter
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	var mergedMovies []interface{}

	for i, movie := range movies {
		if i > 0 {
			<-ticker.C
		}

		title, ok := movie["title"].(string)
		if !ok || title == "" {
			continue
		}

		movieData, err := getMovieByTitle(ctx, title)
		if err != nil {
			log.Printf("Failed to fetch movie for title %s: %v", title, err)
			continue
		}

		imdbID, _ := movieData["imdb_id"].(string)
		if imdbID == "" {
			log.Printf("Skipping movie '%s': no IMDB ID found", title)
			continue
		}

		youtubeID, err := getYouTubeVideoID(ctx, title)
		if err != nil || youtubeID == "" {
			log.Printf("Skipping movie '%s': failed to get YouTube video - %v", title, err)
			continue
		}

		movieData["youtube_id"] = youtubeID
		movieData["plot"] = movie["plot"]
		movieData["genre"] = movie["genre"]

		mergedMovies = append(mergedMovies, movieData)
	}

	// Save to database asynchronously
	go func() {
		saveMoviesToDB(client, mergedMovies, req.UserId, req.FirstName, req.LastName)
	}()

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"movies":  mergedMovies,
	})
}

// getGenresJSON returns the genres JSON string
func getGenresJSON() string {
	return `[
		{"genre_id": 1, "genre_name": "Action"},
		{"genre_id": 2, "genre_name": "Adventure"},
		{"genre_id": 3, "genre_name": "Animation"},
		{"genre_id": 4, "genre_name": "Comedy"},
		{"genre_id": 5, "genre_name": "Crime"},
		{"genre_id": 6, "genre_name": "Documentary"},
		{"genre_id": 7, "genre_name": "Drama"},
		{"genre_id": 8, "genre_name": "Fantasy"},
		{"genre_id": 9, "genre_name": "Historical"},
		{"genre_id": 10, "genre_name": "Horror"},
		{"genre_id": 11, "genre_name": "Musical"},
		{"genre_id": 12, "genre_name": "Mystery"},
		{"genre_id": 13, "genre_name": "Romance"},
		{"genre_id": 14, "genre_name": "Science Fiction"},
		{"genre_id": 15, "genre_name": "Thriller"}
	]`
}

// getYouTubeVideoID fetches YouTube video ID for a movie title
func getYouTubeVideoID(ctx context.Context, title string) (string, error) {
	apiKey := os.Getenv("YOUTUBE_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("missing youtube API config")
	}

	baseURL := "https://www.googleapis.com/youtube/v3/search"
	query := url.QueryEscape(fmt.Sprintf("%s trailer", title))
	requestURL := fmt.Sprintf("%s?part=snippet&type=video&maxResults=1&q=%s&key=%s",
		baseURL, query, apiKey)

	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, "GET", requestURL, nil)
	if err != nil {
		return "", err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result struct {
		Items []struct {
			ID struct {
				VideoID string `json:"videoId"`
			} `json:"id"`
		} `json:"items"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	if len(result.Items) == 0 {
		return "", fmt.Errorf("no videos found")
	}

	return result.Items[0].ID.VideoID, nil
}

// getMovieByTitle fetches movie data by title from external APIs
func getMovieByTitle(ctx context.Context, title string) (map[string]interface{}, error) {
	if title == "" {
		return nil, fmt.Errorf("missing title")
	}

	movie := map[string]interface{}{
		"title":       title,
		"poster_path": "",
		"imdb_id":     "",
	}

	// Try OMDb API
	omdbAPIKey := os.Getenv("OMDB_API_KEY")
	if omdbAPIKey != "" {
		omdbURL := fmt.Sprintf("http://www.omdbapi.com/?apikey=%s&t=%s", omdbAPIKey, url.QueryEscape(title))

		omdbCtx, omdbCancel := context.WithTimeout(ctx, 10*time.Second)
		defer omdbCancel()

		omdbReq, err := http.NewRequestWithContext(omdbCtx, "GET", omdbURL, nil)
		if err == nil {
			resp, err := http.DefaultClient.Do(omdbReq)
			if err == nil {
				defer resp.Body.Close()

				if resp.StatusCode == http.StatusOK {
					var omdbData map[string]interface{}
					if err := json.NewDecoder(resp.Body).Decode(&omdbData); err == nil {
						if responseVal, ok := omdbData["Response"].(string); !ok || !strings.EqualFold(responseVal, "False") {
							if poster, ok := omdbData["Poster"].(string); ok && poster != "N/A" {
								movie["poster_path"] = poster
							}
							if imdbID, ok := omdbData["imdbID"].(string); ok && imdbID != "N/A" {
								movie["imdb_id"] = imdbID
							}
						}
					}
				}
			}
		}
	}

	return movie, nil
}

// saveMoviesToDB saves movies to the database
func saveMoviesToDB(client *mongo.Client, mergedMovies []interface{}, userId, firstName, lastName string) {
	movieCollection := database.OpenCollection("movies", client)
	ctx := context.Background()

	for _, m := range mergedMovies {
		movieMap, ok := m.(map[string]interface{})
		if !ok {
			continue
		}

		var genres []models.Genre
		if rawGenres, ok := movieMap["genre"].([]interface{}); ok {
			for _, g := range rawGenres {
				if gm, ok := g.(map[string]interface{}); ok {
					genre := models.Genre{}
					if name, ok := gm["genre_name"].(string); ok {
						genre.GenreName = name
					}
					if id, ok := gm["genre_id"].(float64); ok {
						genre.GenreID = int(id)
					}
					genres = append(genres, genre)
				}
			}
		}

		movie := models.Movie{
			ImdbID:     getString(movieMap, "imdb_id"),
			Title:      getString(movieMap, "title"),
			PosterPath: getString(movieMap, "poster_path"),
			YoutubeID:  getString(movieMap, "youtube_id"),
			Genre:      genres,
			Plot:       getString(movieMap, "plot"),
			UploadedBy: models.UploadedUser{
				UserID:    userId,
				FirstName: firstName,
				LastName:  lastName,
			},
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		if movie.ImdbID == "" || movie.YoutubeID == "" {
			continue
		}

		// Check for existing movie
		var existing models.Movie
		filter := bson.M{
			"$or": []bson.M{
				{"imdb_id": movie.ImdbID},
				{"title": movie.Title},
			},
		}
		err := movieCollection.FindOne(ctx, filter).Decode(&existing)
		if err == nil {
			log.Printf("Skipping existing movie: %s (%s)", movie.Title, movie.ImdbID)
			continue
		}

		_, err = movieCollection.InsertOne(ctx, movie)
		if err != nil {
			log.Printf("Failed to insert movie '%s': %v", movie.Title, err)
		}
	}
}

// getString extracts a string from a map
func getString(m map[string]interface{}, key string) string {
	if v, ok := m[key]; ok {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}

// YouTube search response type
type YouTubeSearchResponse struct {
	Items []struct {
		ID struct {
			VideoID string `json:"videoId"`
		} `json:"id"`
	} `json:"items"`
}

// collectURL fetches movie by title from Collect API (if configured)
func fetchFromCollectAPI(ctx context.Context, title string) (map[string]interface{}, error) {
	collectURL := os.Getenv("COLLECT_BASE_URL")
	apiKey := os.Getenv("COLLECT_API_KEY")
	if collectURL == "" || apiKey == "" {
		return nil, fmt.Errorf("missing collect API config")
	}

	fullURL := strings.Replace(collectURL, "{title}", url.QueryEscape(title), 1)

	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, "GET", fullURL, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", apiKey)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	var parsed struct {
		Success bool                     `json:"success"`
		Result  []map[string]interface{} `json:"result"`
	}

	if err := json.Unmarshal(body, &parsed); err != nil {
		return nil, fmt.Errorf("failed to parse JSON: %v", err)
	}

	movie := map[string]interface{}{
		"title":       title,
		"poster_path": "",
		"imdb_id":     "",
	}

	if len(parsed.Result) > 0 {
		r := parsed.Result[0]
		if t, ok := r["title"].(string); ok && t != "" {
			movie["title"] = t
		}
		if p, ok := r["poster"].(string); ok {
			movie["poster_path"] = p
		}
		if id, ok := r["imdb_id"].(string); ok {
			movie["imdb_id"] = id
		}
	}

	return movie, nil
}

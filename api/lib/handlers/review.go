package handlers

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

	"github.com/gofiber/fiber/v2"
	"github.com/pawanpdn-671/vstream/api/lib/database"
	"github.com/pawanpdn-671/vstream/api/lib/models"
	"github.com/tmc/langchaingo/llms/openai"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// GetReviewsByMovie returns paginated reviews for a movie
func GetReviewsByMovie(c *fiber.Ctx) error {
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

	page, err1 := strconv.Atoi(c.Query("page", "1"))
	limit, err2 := strconv.Atoi(c.Query("limit", "10"))

	if err1 != nil || err2 != nil || page < 1 || limit < 1 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid pagination parameters"})
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
	err = movieCollection.FindOne(ctx, bson.M{"imdb_id": movieID}).Decode(&movie)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "movie not found"})
	}

	var reviews []models.Review
	cursor, err := reviewCollection.Find(ctx, bson.M{"movie_id": movie.ID}, findOptions)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "error fetching reviews"})
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &reviews); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "error decoding reviews"})
	}

	total, _ := reviewCollection.CountDocuments(ctx, bson.M{"movie_id": movie.ID})

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"page":       page,
		"totalPages": int(math.Ceil(float64(total) / float64(limit))),
		"total":      total,
		"data":       reviews,
	})
}

// GetPopularWords returns popular keywords from movie reviews
func GetPopularWords(c *fiber.Ctx) error {
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
	reviewCollection := database.OpenCollection("reviews", client)

	// Fetch movie to get its ObjectID
	var movie models.Movie
	err = movieCollection.FindOne(ctx, bson.M{"imdb_id": movieID}).Decode(&movie)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "movie not found"})
	}

	var reviews []models.Review
	cursor, err := reviewCollection.Find(ctx, bson.M{"movie_id": movie.ID})
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "error fetching reviews"})
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &reviews); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "error decoding reviews"})
	}

	if len(reviews) > 50 {
		rand.Shuffle(len(reviews), func(i, j int) {
			reviews[i], reviews[j] = reviews[j], reviews[i]
		})
		reviews = reviews[:50]
	}

	groqAPIKey := os.Getenv("GROQ_API_KEY")
	if groqAPIKey == "" {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "missing GROQ_API_KEY"})
	}

	llm, err := openai.New(
		openai.WithToken(groqAPIKey),
		openai.WithBaseURL("https://api.groq.com/openai/v1"),
		openai.WithModel("llama-3.3-70b-versatile"),
	)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
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

	response, err := llm.Call(ctx, prompt)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	re := regexp.MustCompile(`\{[^}]+\}`)
	jsonMatch := re.FindString(response)

	if jsonMatch == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "No valid JSON found in model response"})
	}

	var parsed map[string]interface{}
	if err := json.Unmarshal([]byte(jsonMatch), &parsed); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid JSON in model response"})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"popular_words": parsed["popular_keywords"]})
}

// AddReview adds a new review for a movie
func AddReview(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	imdbID := c.Params("imdb_id")
	if imdbID == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "imdb id is required"})
	}

	var review models.Review
	reviewCollection := database.OpenCollection("reviews", client)
	movieCollection := database.OpenCollection("movies", client)

	// Bind JSON input
	if err := c.BodyParser(&review); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid input"})
	}

	// Validate comment
	if len(review.Comment) < 3 || len(review.Comment) > 1000 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "comment must be between 3 and 1000 characters"})
	}

	// Check if the movie exists
	var movie models.Movie
	err = movieCollection.FindOne(ctx, bson.M{"imdb_id": imdbID}).Decode(&movie)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "movie not found"})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to fetch movie"})
	}

	// Analyze comment with Groq LLM to get rating
	groqAPIKey := os.Getenv("GROQ_API_KEY")
	if groqAPIKey == "" {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "missing GROQ_API_KEY"})
	}

	llm, err := openai.New(
		openai.WithToken(groqAPIKey),
		openai.WithBaseURL("https://api.groq.com/openai/v1"),
		openai.WithModel("llama-3.3-70b-versatile"),
	)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	prompt := fmt.Sprintf(`You are a movie review sentiment analyzer.
		Given the following user comment, return a numeric rating between 1 and 5 only (no text, no explanation):

		1 = terrible
		2 = bad
		3 = average
		4 = good
		5 = excellent

		User comment:
		"%s"

		Respond with only a single number (1-5).`, review.Comment)

	response, err := llm.Call(ctx, prompt)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	raw := strings.TrimSpace(response)

	// Extract numeric rating (1–5)
	re := regexp.MustCompile(`\b[1-5]\b`)
	match := re.FindString(raw)
	if match == "" {
		review.Rating = 3 // default
	} else {
		rating, _ := strconv.ParseFloat(match, 64)
		review.Rating = rating
	}

	// Attach metadata
	review.MovieID = movie.ID
	review.ImdbID = movie.ImdbID
	review.CreatedAt = time.Now()
	review.UpdatedAt = time.Now()

	// Insert review
	result, err := reviewCollection.InsertOne(ctx, review)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to add review"})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"message":     "Review added successfully",
		"inserted_id": result.InsertedID,
		"rating":      review.Rating,
	})
}

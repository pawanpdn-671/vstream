package review

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/database"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/models"
	"github.com/tmc/langchaingo/llms/openai"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

var validate = validator.New()

func AddReview(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		imdbID := c.Param("imdb_id")
		if imdbID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "imdb id is required"})
			return
		}

		var review models.Review
		reviewCollection := database.OpenCollection("reviews", client)
		movieCollection := database.OpenCollection("movies", client)

		// Bind JSON input
		if err := c.ShouldBindJSON(&review); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
			return
		}

		// Validate user/comment fields (ignore rating for now)
		if err := validate.Var(review.Comment, "required,min=3,max=1000"); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid comment", "details": err.Error()})
			return
		}
		if err := validate.Struct(review.User); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user object", "details": err.Error()})
			return
		}

		// Check if the movie exists ---
		var movie models.Movie
		err := movieCollection.FindOne(ctx, bson.M{"imdb_id": imdbID}).Decode(&movie)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusNotFound, gin.H{"error": "movie not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch movie"})
			return
		}

		// Analyze comment with Groq LLM to get rating ---
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

		response, err := llm.Call(c, prompt)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		raw := strings.TrimSpace(response)

		// Extract numeric rating (1–5) ---
		re := regexp.MustCompile(`\b[1-5]\b`)
		match := re.FindString(raw)
		if match == "" {
			fmt.Println("⚠️ Groq did not return a valid rating, defaulting to 3")
			review.Rating = 3
		} else {
			rating, _ := strconv.ParseFloat(match, 64)
			review.Rating = rating
		}

		// Attach metadata ---
		review.MovieID = movie.ID
		review.CreatedAt = time.Now()
		review.UpdatedAt = time.Now()

		// Insert review ---
		result, err := reviewCollection.InsertOne(ctx, review)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add review"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message":     "Review added successfully",
			"inserted_id": result.InsertedID,
			"rating":      review.Rating,
		})
	}
}

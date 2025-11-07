package movie

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/database"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

var validate = validator.New()

func AddMovie(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var movie models.Movie
		movieCollection := database.OpenCollection("movies", client)

		if err := c.ShouldBindJSON(&movie); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
			return
		}

		if err := validate.Struct(movie); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "validation failed",
				"details": err.Error(),
			})
			return
		}

		var existingMovie models.Movie
		err := movieCollection.FindOne(ctx, bson.M{"imdb_id": movie.ImdbID}).Decode(&existingMovie)
		if err == nil {
			c.JSON(http.StatusConflict, gin.H{
				"error": "Movie already exists",
				"id":    existingMovie.ID,
			})
			return
		} else if err != mongo.ErrNoDocuments {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to check existing movie",
			})
			return
		}
		movie.CreatedAt = time.Now()
		movie.UpdatedAt = time.Now()

		result, err := movieCollection.InsertOne(ctx, movie)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add movie"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message":     "Movie added successfully",
			"inserted_id": result.InsertedID,
		})

	}
}

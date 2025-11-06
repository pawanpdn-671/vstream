package movie

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/database"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func DeleteMovie(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c, 100*time.Second)
		defer cancel()

		movieID := c.Param("id")
		if movieID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "movie ID is required"})
			return
		}

		movieCollection := database.OpenCollection("movies", client)

		filter := bson.M{"imdb_id": movieID}

		result, err := movieCollection.DeleteOne(ctx, filter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete movie"})
			return
		}

		if result.DeletedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "movie not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "movie deleted successfully",
		})
	}
}

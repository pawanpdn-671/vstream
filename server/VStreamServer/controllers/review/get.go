package review

import (
	"context"
	"math"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/database"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/models"
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

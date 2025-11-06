package movie

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/database"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/utils"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func AdminReviewUpdate(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, err := utils.GetUserRoleFromContext(c)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Role not found in context"})
			return
		}
		if role != "ADMIN" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User must be part of the ADMIN role"})
			return
		}

		movieId := c.Param("imdb_id")

		if movieId == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Movie id required"})
			return
		}
		var req struct {
			AdminReview string `json:"admin_review"`
		}

		var resp struct {
			RankingName string `json:"ranking_name"`
			AdminReview string `json:"admin_review"`
		}

		if err := c.ShouldBind(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		sentiment, rankVal, err := GetReviewRanking(req.AdminReview, client, c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting review ranking"})
			return
		}

		filter := bson.M{"imdb_id": movieId}

		update := bson.M{
			"$set": bson.M{
				"admin_review": req.AdminReview,
				"ranking": bson.M{
					"ranking_value": rankVal,
					"ranking_name":  sentiment,
				},
			},
		}

		var ctx, cancel = context.WithTimeout(c, 100*time.Second)
		defer cancel()

		var movieCollection *mongo.Collection = database.OpenCollection("movies", client)
		result, err := movieCollection.UpdateOne(ctx, filter, update)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating movie"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "movie not found!"})
			return
		}

		resp.RankingName = sentiment
		resp.AdminReview = req.AdminReview

		c.JSON(http.StatusOK, resp)
	}

}

func UpdateMovie(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c, 100*time.Second)
		defer cancel()

		movieID := c.Param("id")
		if movieID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "movie ID is required"})
			return
		}

		var updateData map[string]interface{}
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
			return
		}

		// Remove _id if present, we never allow updates to _id
		delete(updateData, "_id")

		// Ensure there’s at least one field to update
		if len(updateData) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "no fields provided to update"})
			return
		}

		movieCollection := database.OpenCollection("movies", client)

		filter := bson.M{"imdb_id": movieID}
		update := bson.M{"$set": updateData}

		opts := options.UpdateOne().SetUpsert(false)
		result, err := movieCollection.UpdateOne(ctx, filter, update, opts)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update movie"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "movie not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Movie updated successfully",
		})
	}
}

package review

import (
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func RegisterPrivateRoutes(router *gin.Engine, client *mongo.Client) {
	router.GET("/movies/:imdb_id/reviews", GetReviewsByMovie(client))
	router.GET("/movies/:imdb_id/reviews/topics", GetPopularWords(client))
	router.POST("/movies/:imdb_id/add_review", AddReview(client))
}

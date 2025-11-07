package review

import (
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func RegisterPrivateRoutes(router *gin.Engine, client *mongo.Client) {
	router.GET("/movies/:imdb_id/reviews", GetReviewsByMovie(client))
	router.POST("/movies/:imdb_id/add_review", AddReview(client))
}

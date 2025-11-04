package movie

import (
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func RegisterPrivateRoutes(router *gin.Engine, client *mongo.Client) {
	router.GET("/movie/:imdb_id", GetMovie(client))
	router.POST("/addmovie", AddMovie(client))
	router.GET("/recommended_movies", GetRecommendedMovies(client))
	router.PATCH("/update_review/:imdb_id", AdminReviewUpdate(client))
	router.POST("/movie/user_story/wai", GenerateMovieFromStory(client))
}

func RegisterPublicRoutes(router *gin.Engine, client *mongo.Client) {
	router.GET("/movies", GetMovies(client))
	router.GET("/genres", GetGenres(client))
}

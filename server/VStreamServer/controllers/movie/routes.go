package movie

import (
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func RegisterPrivateRoutes(router *gin.Engine, client *mongo.Client) {
	router.GET("/movie/:imdb_id", GetMovie(client))
	router.POST("/movie/add", AddMovie(client))
	router.GET("/recommended_movies", GetRecommendedMovies(client))
	router.POST("/movie/user_story/wai", GenerateMovieFromStory(client))
	router.PATCH("/movie/:id/update", UpdateMovie(client))
	router.DELETE("/movie/:id/delete", DeleteMovie(client))
	router.PATCH("/movies/:imdb_id/reaction", LikeOrDislikeMovie(client))
}

func RegisterPublicRoutes(router *gin.Engine, client *mongo.Client) {
	router.GET("/movies", GetMovies(client))
	router.GET("/genres", GetGenres(client))
}

package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/controllers"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/middleware"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func SetupProtectedRoutes(router *gin.Engine, client *mongo.Client) {
	router.Use(middleware.AuthMiddleware())

	router.GET("/movie/:imdb_id", controllers.GetMovie(client))
	router.POST("/addmovie", controllers.AddMovie(client))
	router.GET("/recommended_movies", controllers.GetRecommendedMovies(client))
	router.PATCH("/update_review/:imdb_id", controllers.AdminReviewUpdate(client))

	// USERS
	router.GET("/me", controllers.GetCurrentUser(client))

}

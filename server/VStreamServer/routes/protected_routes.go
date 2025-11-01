package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/controllers"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/middleware"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func SetupProtectedRoutes(router *gin.Engine, client *mongo.Client) {
	router.Use(middleware.AuthMiddleware())

	// MOVIES
	router.GET("/movie/:imdb_id", controllers.GetMovie(client))
	router.POST("/addmovie", controllers.AddMovie(client))
	router.GET("/recommended_movies", controllers.GetRecommendedMovies(client))
	router.PATCH("/update_review/:imdb_id", controllers.AdminReviewUpdate(client))
	router.GET("/bookmarked_movies", controllers.GetBookmarkedMovies(client))

	// USERS
	router.GET("/me", controllers.GetCurrentUser(client))
	router.POST("/me/update", controllers.UpdateUser(client))
	router.POST("/me/upload_avatar", controllers.UploadUserAvatar(client))
	router.POST("/me/change_password", controllers.UpdatePassword(client))
	router.GET("/users/:user_id/avatar", controllers.GetUserAvatar(client))
}

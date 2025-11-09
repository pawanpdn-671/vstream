package user

import (
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func RegisterPrivateRoutes(router *gin.Engine, client *mongo.Client) {
	router.GET("/me", GetCurrentUser(client))
	router.GET("/users/:user_id/avatar", GetUserAvatar(client))
	router.GET("/me/bookmarked_movies", GetBookmarkedMovies(client))
	router.GET("/me/liked_movies", GetLikedMovies(client))
	router.GET("/me/reviews", GetUserReviews(client))
	router.POST("/movie/expert-help", GetExpertHelp(client))
	router.POST("/me/update", UpdateUser(client))
	router.POST("/me/upload_avatar", UploadUserAvatar(client))
	router.POST("/me/change_password", UpdatePassword(client))
	router.POST("/bookmark/:movieId", ToggleBookmarkMovie(client))
}

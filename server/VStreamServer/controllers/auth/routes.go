package auth

import (
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func RegisterPublicRoutes(router *gin.Engine, client *mongo.Client) {
	router.POST("/register", RegisterUser(client))
	router.POST("/login", LoginUser(client))
	router.POST("/logout", LogoutHandler(client))
	router.POST("/refresh", RefreshTokenHandler(client))
}

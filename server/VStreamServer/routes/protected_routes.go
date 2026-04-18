package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/controllers/movie"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/controllers/review"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/controllers/user"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/middleware"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func SetupProtectedRoutes(router *gin.RouterGroup, client *mongo.Client) {
	protected := router.Group("")
	protected.Use(middleware.AuthMiddleware())

	// MOVIES
	movie.RegisterPrivateRoutes(protected, client)

	// USERS
	user.RegisterPrivateRoutes(protected, client)

	//REVIEWS
	review.RegisterPrivateRoutes(protected, client)
}

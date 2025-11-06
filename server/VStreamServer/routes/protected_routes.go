package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/controllers/movie"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/controllers/review"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/controllers/user"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/middleware"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func SetupProtectedRoutes(router *gin.Engine, client *mongo.Client) {
	router.Use(middleware.AuthMiddleware())

	// MOVIES
	movie.RegisterPrivateRoutes(router, client)

	// USERS
	user.RegisterPrivateRoutes(router, client)

	//REVIEWS
	review.RegisterPrivateRoutes(router, client)
}

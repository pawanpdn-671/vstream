package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/controllers/auth"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/controllers/movie"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func SetupUnprotectedRoutes(router *gin.Engine, client *mongo.Client) {
	movie.RegisterPublicRoutes(router, client)
	auth.RegisterPublicRoutes(router, client)
}

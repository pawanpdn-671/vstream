package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/controllers"
)

func SetupUnprotectedRoutes(router *gin.Engine) {
	router.GET("/movies", controllers.GetMovies())
	router.POST("/register", controllers.RegisterUser())
	router.POST("/login", controllers.LoginUser())
}

package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/controllers"
)

func main() {

	router := gin.Default()

	router.GET("/hello", func(c *gin.Context) {
		c.String(200, "Hello, VStream movies")
	})

	router.GET("/movies", controllers.GetMovies())
	router.GET("/movie/:imdb_id", controllers.GetMovie())

	if err := router.Run(":8080"); err != nil {
		fmt.Println("Failed to start server", err)
	}
}

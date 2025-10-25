package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/routes"
)

func main() {

	router := gin.Default()

	routes.SetupUnprotectedRoutes(router)
	routes.SetupProtectedRoutes(router)

	if err := router.Run(":8080"); err != nil {
		fmt.Println("Failed to start server", err)
	}
}

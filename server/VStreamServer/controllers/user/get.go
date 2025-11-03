package user

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/database"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/models"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/utils"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func GetCurrentUser(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get access token from cookie
		accessToken, err := c.Cookie("access_token")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Access token not found"})
			return
		}

		// Validate token
		claims, err := utils.ValidateToken(accessToken)
		if err != nil || claims == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		// Fetch user from MongoDB
		var ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		userCollection := database.OpenCollection("users", client)
		var user models.User

		err = userCollection.FindOne(ctx, bson.M{"user_id": claims.UserId}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		user.Password = ""
		c.JSON(http.StatusOK, user)
	}
}

func GetUserAvatar(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c, 10*time.Second)
		defer cancel()

		userId := c.Param("user_id")

		userCollection := database.OpenCollection("users", client)
		var user models.User

		// Find the user
		err := userCollection.FindOne(ctx, bson.M{"user_id": userId}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		if user.AvatarURL == "" {
			c.JSON(http.StatusNotFound, gin.H{"error": "No avatar found"})
			return
		}

		// Convert string to ObjectID
		objID, err := bson.ObjectIDFromHex(user.AvatarURL)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid avatar ID"})
			return
		}

		db := client.Database(os.Getenv("DATABASE_NAME"))
		bucket := db.GridFSBucket()

		// Open the file stream from GridFS
		stream, err := bucket.OpenDownloadStream(ctx, objID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not open avatar"})
			return
		}

		defer stream.Close()

		// Read the image bytes
		var buf bytes.Buffer
		_, err = io.Copy(&buf, stream)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read avatar"})
			return
		}

		// Detect content type (optional but nice)
		contentType := http.DetectContentType(buf.Bytes())

		c.Header("Cache-Control", "no-store")
		c.Header("Content-Type", contentType)
		c.Writer.WriteHeader(http.StatusOK)
		c.Writer.Write(buf.Bytes())
	}
}

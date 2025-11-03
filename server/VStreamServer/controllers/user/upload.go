package user

import (
	"bytes"
	"context"
	"image"
	"image/jpeg"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nfnt/resize"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/database"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/models"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/utils"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func UploadUserAvatar(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(c, 100*time.Second)
		defer cancel()

		userId, err := utils.GetUserIdFromContext(c)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized user found."})
			return
		}

		file, _, err := c.Request.FormFile("avatar")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Avatar file is required"})
			return
		}
		defer file.Close()

		// Decode and resize
		img, _, err := image.Decode(file)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid image file"})
			return
		}

		resized := resize.Resize(256, 0, img, resize.Lanczos3)
		var buf bytes.Buffer
		if err := jpeg.Encode(&buf, resized, &jpeg.Options{Quality: 80}); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encode image"})
			return
		}

		databaseName := os.Getenv("DATABASE_NAME")
		db := client.Database(databaseName)

		bucket := db.GridFSBucket()

		// Check if user already has an avatar
		userCollection := database.OpenCollection("users", client)

		var existing models.User
		err = userCollection.FindOne(ctx, bson.M{"user_id": userId}).Decode(&existing)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		// Delete old avatar if exists
		if existing.AvatarURL != "" {
			if objID, err := bson.ObjectIDFromHex(existing.AvatarURL); err == nil {
				_ = bucket.Delete(ctx, objID)
			}
		}

		// Upload new image to GridFS
		filename := userId + "_avatar.jpg"
		uploadOpts := options.GridFSUpload().SetMetadata(bson.D{{Key: "user_id", Value: userId}})

		objectID, err := bucket.UploadFromStream(ctx, filename, bytes.NewReader(buf.Bytes()), uploadOpts)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload avatar"})
			return
		}

		// Update user's avatar info
		update := bson.M{"$set": bson.M{
			"avatar_url": objectID.Hex(),
			"updated_at": time.Now(),
		}}

		opts := options.FindOneAndUpdate().SetReturnDocument(options.After)

		var updatedUser models.User
		err = userCollection.FindOneAndUpdate(ctx, bson.M{"user_id": userId}, update, opts).Decode(&updatedUser)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user avatar"})
			return
		}

		updatedUser.Password = ""

		c.JSON(http.StatusOK, gin.H{
			"message": "Avatar uploaded successfully",
		})
	}
}

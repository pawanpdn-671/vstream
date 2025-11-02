package controllers

import (
	"bytes"
	"context"
	"fmt"
	"image"
	"image/jpeg"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/nfnt/resize"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/database"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/models"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/utils"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	HashPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	if err != nil {
		return "", err
	}

	return string(HashPassword), nil
}

func RegisterUser(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user models.User

		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data"})
			return
		}

		validate := validator.New()

		if err := validate.Struct(user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Input validation failed", "details": err.Error()})
			return
		}

		hashedPassword, err := HashPassword(user.Password)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to hash password"})
			return
		}

		var ctx, cancel = context.WithTimeout(c, 100*time.Second)
		defer cancel()

		var userCollection *mongo.Collection = database.OpenCollection("users", client)
		count, err := userCollection.CountDocuments(ctx, bson.M{"email": user.Email})

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check existing user"})
			return
		}

		if count > 0 {
			c.JSON(http.StatusConflict, gin.H{"error": "User already exists!"})
			return
		}

		user.UserID = bson.NewObjectID().Hex()
		user.CreatedAt = time.Now()
		user.UpdatedAt = time.Now()
		user.Password = hashedPassword

		result, err := userCollection.InsertOne(ctx, user)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}

		c.JSON(http.StatusCreated, result)
	}
}

func LoginUser(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var userLogin models.UserLogin

		if err := c.ShouldBindJSON(&userLogin); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid login data"})
			return
		}

		var ctx, cancel = context.WithTimeout(c, 100*time.Second)
		defer cancel()

		var foundUser models.User

		var userCollection *mongo.Collection = database.OpenCollection("users", client)
		err := userCollection.FindOne(ctx, bson.M{"email": userLogin.Email}).Decode(&foundUser)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
			return
		}

		err = bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(userLogin.Password))
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
			return
		}

		token, refreshToken, err := utils.GenerateAllToken(foundUser.Email, foundUser.FirstName, foundUser.LastName, foundUser.Role, foundUser.UserID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate tokens"})
			return
		}

		c.SetCookie("access_token", token, int(utils.TokenExpirationTime.Seconds()), "/", "", false, true)
		c.SetCookie("refresh_token", refreshToken, int(utils.RefreshTokenExpirationTime.Seconds()), "/", "", false, true)

		c.JSON(http.StatusOK, models.UserResponse{
			Email:  foundUser.Email,
			UserId: foundUser.UserID,
		})
	}
}

func LogoutHandler(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		http.SetCookie(c.Writer, &http.Cookie{
			Name:     "access_token",
			Value:    "",
			Path:     "/",
			MaxAge:   -1,
			Secure:   true,
			HttpOnly: true,
			SameSite: http.SameSiteNoneMode,
		})

		http.SetCookie(c.Writer, &http.Cookie{
			Name:     "refresh_token",
			Value:    "",
			Path:     "/",
			MaxAge:   -1,
			Secure:   true,
			HttpOnly: true,
			SameSite: http.SameSiteNoneMode,
		})

		c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
	}
}

func RefreshTokenHandler(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(c, 100*time.Second)
		defer cancel()

		refreshToken, err := c.Cookie("refresh_token")

		if err != nil {
			fmt.Println("error", err.Error())
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unable to retrieve refresh token from cookie"})
			return
		}

		claim, err := utils.ValidateRefreshToken(refreshToken)
		if err != nil || claim == nil {
			fmt.Println("error", err.Error())
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired refresh token"})
			return
		}

		var userCollection *mongo.Collection = database.OpenCollection("users", client)

		var user models.User
		err = userCollection.FindOne(ctx, bson.D{{Key: "user_id", Value: claim.UserId}}).Decode(&user)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			return
		}

		newToken, newRefreshToken, _ := utils.GenerateAllToken(user.Email, user.FirstName, user.LastName, user.Role, user.UserID)

		c.SetCookie("access_token", newToken, int(utils.TokenExpirationTime.Seconds()), "/", "", false, true)
		c.SetCookie("refresh_token", newRefreshToken, int(utils.RefreshTokenExpirationTime.Seconds()), "/", "", false, true)

		c.JSON(http.StatusOK, gin.H{"message": "Tokens refreshed"})
	}
}

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

func UpdateUser(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(c, 100*time.Second)
		defer cancel()

		userId, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized user"})
			return
		}

		var userUpdate models.UserUpdate
		if err := c.ShouldBindJSON(&userUpdate); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data"})
			return
		}

		validate := validator.New()
		if err := validate.Struct(userUpdate); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Validation failed",
				"details": err.Error(),
			})
			return
		}

		userCollection := database.OpenCollection("users", client)

		update := bson.M{
			"$set": bson.M{
				"first_name":       userUpdate.FirstName,
				"last_name":        userUpdate.LastName,
				"email":            userUpdate.Email,
				"favourite_genres": userUpdate.FavouriteGenres,
				"updated_at":       time.Now(),
			},
		}

		opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
		var updatedUser models.User

		err = userCollection.FindOneAndUpdate(ctx, bson.M{"user_id": userId}, update, opts).Decode(&updatedUser)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
			return
		}

		updatedUser.Password = ""

		c.JSON(http.StatusOK, gin.H{
			"message": "User updated successfully",
			"user":    updatedUser,
		})
	}
}

func UpdatePassword(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(c, 100*time.Second)
		defer cancel()

		// Authenticate user
		userId, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized user"})
			return
		}

		// Parse input
		var req struct {
			OldPassword string `json:"old_password" binding:"required"`
			NewPassword string `json:"new_password" binding:"required,min=6"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data"})
			return
		}

		userCollection := database.OpenCollection("users", client)

		// Find user
		var user models.User
		err = userCollection.FindOne(ctx, bson.M{"user_id": userId}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		// Check old password
		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Old password is incorrect"})
			return
		}

		// Hash new password
		hashedPassword, err := HashPassword(req.NewPassword)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash new password"})
			return
		}

		// Update password
		update := bson.M{
			"$set": bson.M{
				"password":   hashedPassword,
				"updated_at": time.Now(),
			},
		}
		_, err = userCollection.UpdateOne(ctx, bson.M{"user_id": userId}, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
	}
}

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

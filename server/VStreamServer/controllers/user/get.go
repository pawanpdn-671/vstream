package user

import (
	"bytes"
	"context"
	"io"
	"math"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/database"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/models"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/utils"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
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

func GetBookmarkedMovies(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(c, 100*time.Second)
		defer cancel()

		userId, err := utils.GetUserIdFromContext(c)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No user found to get bookmarked movies."})
			return
		}

		var user models.User

		userCollection := database.OpenCollection("users", client)
		err = userCollection.FindOne(ctx, bson.M{"user_id": userId}).Decode(&user)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if len(user.BookmarkedMovieIDs) == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "No bookmarks added for this user."})
			return
		}

		movieCollection := database.OpenCollection("movies", client)
		filter := bson.M{"_id": bson.M{"$in": user.BookmarkedMovieIDs}}

		cursor, err := movieCollection.Find(ctx, filter)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		defer cursor.Close(ctx)

		var bookmarkedMovies []models.Movie
		if err = cursor.All(ctx, &bookmarkedMovies); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to decode bookmarked movies."})
			return
		}

		c.JSON(http.StatusOK, bookmarkedMovies)
	}
}

func GetLikedMovies(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		userId, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No user found."})
			return
		}

		var user models.User
		userCollection := database.OpenCollection("users", client)
		err = userCollection.FindOne(ctx, bson.M{"user_id": userId}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		page, err1 := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, err2 := strconv.Atoi(c.DefaultQuery("limit", "10"))
		if err1 != nil || err2 != nil || page < 1 || limit < 1 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pagination parameters"})
			return
		}

		if len(user.LikedMovies) == 0 {
			c.JSON(http.StatusOK, gin.H{
				"page":       page,
				"total":      0,
				"totalPages": 0,
				"data":       []models.Movie{},
			})
			return
		}

		skip := (page - 1) * limit
		movieCollection := database.OpenCollection("movies", client)

		filter := bson.M{"_id": bson.M{"$in": user.LikedMovies}}
		findOptions := options.Find().SetSkip(int64(skip)).SetLimit(int64(limit))

		cursor, err := movieCollection.Find(ctx, filter, findOptions)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching liked movies."})
			return
		}
		defer cursor.Close(ctx)

		var likedMovies []models.Movie
		if err = cursor.All(ctx, &likedMovies); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding liked movies."})
			return
		}

		total := int64(len(user.LikedMovies))
		totalPages := int(math.Ceil(float64(total) / float64(limit)))

		c.JSON(http.StatusOK, gin.H{
			"page":       page,
			"total":      total,
			"totalPages": totalPages,
			"data":       likedMovies,
		})
	}
}

func GetUserReviews(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(c, 100*time.Second)
		defer cancel()

		userId, err := utils.GetUserIdFromContext(c)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No user found."})
			return
		}

		page, err1 := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, err2 := strconv.Atoi(c.DefaultQuery("limit", "10"))

		if err1 != nil || err2 != nil || page < 1 || limit < 1 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pagination parameters"})
			return
		}

		skip := (page - 1) * limit

		findOptions := options.Find()
		findOptions.SetSkip(int64(skip))
		findOptions.SetLimit(int64(limit))
		findOptions.SetSort(bson.M{"created_at": -1})

		reviewCollection := database.OpenCollection("reviews", client)
		filter := bson.M{"user.user_id": userId}

		cursor, err := reviewCollection.Find(ctx, filter, findOptions)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching reviews."})
			return
		}
		defer cursor.Close(ctx)

		var userReviews []models.Review
		if err := cursor.All(ctx, &userReviews); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding reviews."})
			return
		}

		total, _ := reviewCollection.CountDocuments(ctx, filter)

		c.JSON(http.StatusOK, gin.H{
			"page":       page,
			"total":      total,
			"totalPages": int(math.Ceil(float64(total) / float64(limit))),
			"data":       userReviews,
		})
	}
}

package movie

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/database"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/models"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/utils"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func UpdateMovie(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c, 100*time.Second)
		defer cancel()

		movieID := c.Param("id")
		if movieID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "movie ID is required"})
			return
		}

		var updateData map[string]interface{}
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
			return
		}

		// Remove _id if present, we never allow updates to _id
		delete(updateData, "_id")

		// Ensure there’s at least one field to update
		if len(updateData) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "no fields provided to update"})
			return
		}
		updateData["updated_at"] = time.Now()

		movieCollection := database.OpenCollection("movies", client)

		filter := bson.M{"imdb_id": movieID}
		update := bson.M{"$set": updateData}

		opts := options.UpdateOne().SetUpsert(false)
		result, err := movieCollection.UpdateOne(ctx, filter, update, opts)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update movie"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "movie not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Movie updated successfully",
		})
	}
}

func LikeOrDislikeMovie(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		imdbID := c.Param("imdb_id")
		action := c.Query("action") // "like" or "dislike"

		if imdbID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "movie id is required"})
			return
		}
		if action != "like" && action != "dislike" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid action, must be 'like' or 'dislike'"})
			return
		}

		userId, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found or unauthorized."})
			return
		}

		movieCollection := database.OpenCollection("movies", client)
		userCollection := database.OpenCollection("users", client)

		// Fetch movie
		var movie models.Movie
		err = movieCollection.FindOne(ctx, bson.M{"imdb_id": imdbID}).Decode(&movie)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "movie not found"})
			return
		}

		// Fetch user
		var user models.User
		err = userCollection.FindOne(ctx, bson.M{"user_id": userId}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}

		userObjID, err := bson.ObjectIDFromHex(userId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
			return
		}

		movieID := movie.ID
		alreadyLiked := utils.ContainsObjectID(movie.LikedBy, userObjID)
		alreadyDisliked := utils.ContainsObjectID(movie.DislikedBy, userObjID)

		var movieUpdate bson.M
		var userUpdate bson.M
		var message string

		switch action {
		case "like":
			switch {
			case alreadyLiked:
				// 👎 Unlike (remove like)
				movieUpdate = bson.M{
					"$inc":  bson.M{"likes": -1},
					"$pull": bson.M{"liked_by": userObjID},
				}
				userUpdate = bson.M{
					"$pull": bson.M{"liked_movies": movieID},
				}
				message = "Movie unliked successfully"

			case alreadyDisliked:
				// 🔁 Switch from dislike → like
				movieUpdate = bson.M{
					"$inc":  bson.M{"likes": 1, "dislikes": -1},
					"$pull": bson.M{"disliked_by": userObjID},
					"$push": bson.M{"liked_by": userObjID},
				}
				userUpdate = bson.M{
					"$pull": bson.M{"disliked_movies": movieID},
					"$push": bson.M{"liked_movies": movieID},
				}
				message = "Switched from dislike to like"

			default:
				// 👍 First time like
				movieUpdate = bson.M{
					"$inc":  bson.M{"likes": 1},
					"$push": bson.M{"liked_by": userObjID},
				}
				userUpdate = bson.M{
					"$push": bson.M{"liked_movies": movieID},
				}
				message = "Movie liked successfully"
			}

		case "dislike":
			switch {
			case alreadyDisliked:
				// 👎 Remove dislike
				movieUpdate = bson.M{
					"$inc":  bson.M{"dislikes": -1},
					"$pull": bson.M{"disliked_by": userObjID},
				}
				userUpdate = bson.M{
					"$pull": bson.M{"disliked_movies": movieID},
				}
				message = "Dislike removed successfully"

			case alreadyLiked:
				// 🔁 Switch from like → dislike
				movieUpdate = bson.M{
					"$inc":  bson.M{"likes": -1, "dislikes": 1},
					"$pull": bson.M{"liked_by": userObjID},
					"$push": bson.M{"disliked_by": userObjID},
				}
				userUpdate = bson.M{
					"$pull": bson.M{"liked_movies": movieID},
					"$push": bson.M{"disliked_movies": movieID},
				}
				message = "Switched from like to dislike"

			default:
				// 👎 First time dislike
				movieUpdate = bson.M{
					"$inc":  bson.M{"dislikes": 1},
					"$push": bson.M{"disliked_by": userObjID},
				}
				userUpdate = bson.M{
					"$push": bson.M{"disliked_movies": movieID},
				}
				message = "Movie disliked successfully"
			}
		}

		// ✅ Apply both updates
		if len(movieUpdate) > 0 {
			_, err = movieCollection.UpdateOne(ctx, bson.M{"_id": movie.ID}, movieUpdate)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update movie"})
				return
			}
		}

		if len(userUpdate) > 0 {
			_, err = userCollection.UpdateOne(ctx, bson.M{"_id": user.ID}, userUpdate)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user"})
				return
			}
		}

		c.JSON(http.StatusOK, gin.H{"message": message})
	}
}

package handlers

import (
	"bytes"
	"context"
	"image"
	"image/jpeg"
	"math"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/nfnt/resize"
	"github.com/pawanpdn-671/vstream/api/lib/database"
	"github.com/pawanpdn-671/vstream/api/lib/middleware"
	"github.com/pawanpdn-671/vstream/api/lib/models"
	"github.com/pawanpdn-671/vstream/api/lib/utils"
	"github.com/tmc/langchaingo/llms/openai"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

var userValidate = validator.New()

// GetCurrentUser returns the current authenticated user
func GetCurrentUser(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	// Get access token from cookie
	accessToken := c.Cookies("access_token")
	if accessToken == "" {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Access token not found"})
	}

	// Validate token
	claims, err := utils.ValidateToken(accessToken)
	if err != nil || claims == nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid or expired token"})
	}

	// Fetch user from MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userCollection := database.OpenCollection("users", client)
	var user models.User

	err = userCollection.FindOne(ctx, bson.M{"user_id": claims.UserId}).Decode(&user)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	user.Password = ""
	return c.Status(http.StatusOK).JSON(user)
}

// GetUserAvatar returns the user's avatar image
func GetUserAvatar(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userId := c.Params("user_id")

	userCollection := database.OpenCollection("users", client)
	var user models.User

	err = userCollection.FindOne(ctx, bson.M{"user_id": userId}).Decode(&user)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	if user.AvatarURL == "" {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "No avatar found"})
	}

	// Convert string to ObjectID
	objID, err := bson.ObjectIDFromHex(user.AvatarURL)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid avatar ID"})
	}

	db := client.Database(os.Getenv("DATABASE_NAME"))
	bucket := db.GridFSBucket()

	// Open the file stream from GridFS
	stream, err := bucket.OpenDownloadStream(ctx, objID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Could not open avatar"})
	}
	defer stream.Close()

	// Read the image bytes
	var buf bytes.Buffer
	_, err = buf.ReadFrom(stream)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to read avatar"})
	}

	// Detect content type
	contentType := http.DetectContentType(buf.Bytes())

	c.Set("Cache-Control", "no-store")
	c.Set("Content-Type", contentType)
	return c.Send(buf.Bytes())
}

// GetBookmarkedMovies returns the user's bookmarked movies
func GetBookmarkedMovies(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	userId, ok := middleware.GetUserIdFromLocals(c)
	if !ok {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "No user found to get bookmarked movies."})
	}

	var user models.User
	userCollection := database.OpenCollection("users", client)
	err = userCollection.FindOne(ctx, bson.M{"user_id": userId}).Decode(&user)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	if len(user.BookmarkedMovieIDs) == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "No bookmarks added for this user."})
	}

	movieCollection := database.OpenCollection("movies", client)
	filter := bson.M{"_id": bson.M{"$in": user.BookmarkedMovieIDs}}

	cursor, err := movieCollection.Find(ctx, filter)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	defer cursor.Close(ctx)

	var bookmarkedMovies []models.Movie
	if err = cursor.All(ctx, &bookmarkedMovies); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Failed to decode bookmarked movies."})
	}

	return c.Status(http.StatusOK).JSON(bookmarkedMovies)
}

// GetLikedMovies returns the user's liked movies with pagination
func GetLikedMovies(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	userId, ok := middleware.GetUserIdFromLocals(c)
	if !ok {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "No user found."})
	}

	var user models.User
	userCollection := database.OpenCollection("users", client)
	err = userCollection.FindOne(ctx, bson.M{"user_id": userId}).Decode(&user)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	page, err1 := strconv.Atoi(c.Query("page", "1"))
	limit, err2 := strconv.Atoi(c.Query("limit", "10"))
	if err1 != nil || err2 != nil || page < 1 || limit < 1 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid pagination parameters"})
	}

	if len(user.LikedMovies) == 0 {
		return c.Status(http.StatusOK).JSON(fiber.Map{
			"page":       page,
			"total":      0,
			"totalPages": 0,
			"data":       []models.Movie{},
		})
	}

	skip := (page - 1) * limit
	movieCollection := database.OpenCollection("movies", client)

	filter := bson.M{"_id": bson.M{"$in": user.LikedMovies}}
	findOptions := options.Find().SetSkip(int64(skip)).SetLimit(int64(limit))

	cursor, err := movieCollection.Find(ctx, filter, findOptions)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error fetching liked movies."})
	}
	defer cursor.Close(ctx)

	var likedMovies []models.Movie
	if err = cursor.All(ctx, &likedMovies); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error decoding liked movies."})
	}

	total := int64(len(user.LikedMovies))
	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"page":       page,
		"total":      total,
		"totalPages": totalPages,
		"data":       likedMovies,
	})
}

// GetUserReviews returns the user's reviews with pagination
func GetUserReviews(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	userId, ok := middleware.GetUserIdFromLocals(c)
	if !ok {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "No user found."})
	}

	page, err1 := strconv.Atoi(c.Query("page", "1"))
	limit, err2 := strconv.Atoi(c.Query("limit", "10"))
	if err1 != nil || err2 != nil || page < 1 || limit < 1 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid pagination parameters"})
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
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error fetching reviews."})
	}
	defer cursor.Close(ctx)

	var userReviews []models.Review
	if err := cursor.All(ctx, &userReviews); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error decoding reviews."})
	}

	total, _ := reviewCollection.CountDocuments(ctx, filter)

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"page":       page,
		"total":      total,
		"totalPages": int(math.Ceil(float64(total) / float64(limit))),
		"data":       userReviews,
	})
}

// UpdateUser updates user profile
func UpdateUser(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	userId, ok := middleware.GetUserIdFromLocals(c)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized user"})
	}

	var userUpdate models.UserUpdate
	if err := c.BodyParser(&userUpdate); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input data"})
	}

	if err := userValidate.Struct(userUpdate); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error":   "Validation failed",
			"details": err.Error(),
		})
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
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update user"})
	}

	updatedUser.Password = ""

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "User updated successfully",
		"user":    updatedUser,
	})
}

// UpdatePassword changes user password
func UpdatePassword(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	userId, ok := middleware.GetUserIdFromLocals(c)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized user"})
	}

	var req struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input data"})
	}

	if req.OldPassword == "" || len(req.NewPassword) < 6 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid password data"})
	}

	userCollection := database.OpenCollection("users", client)

	var user models.User
	err = userCollection.FindOne(ctx, bson.M{"user_id": userId}).Decode(&user)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Old password is incorrect"})
	}

	hashedPassword, err := HashPassword(req.NewPassword)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to hash new password"})
	}

	update := bson.M{
		"$set": bson.M{
			"password":   hashedPassword,
			"updated_at": time.Now(),
		},
	}
	_, err = userCollection.UpdateOne(ctx, bson.M{"user_id": userId}, update)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update password"})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"message": "Password updated successfully"})
}

// ToggleBookmarkMovie toggles bookmark status for a movie
func ToggleBookmarkMovie(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	userId, ok := middleware.GetUserIdFromLocals(c)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "User not found or unauthorized."})
	}

	movieId := c.Params("movieId")
	if movieId == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Movie ID is required."})
	}

	movieObjectID, err := bson.ObjectIDFromHex(movieId)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid movie ID format"})
	}

	userCollection := database.OpenCollection("users", client)

	var user models.User
	err = userCollection.FindOne(ctx, bson.M{"user_id": userId}).Decode(&user)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "User not found."})
	}

	// Check if the movie is already bookmarked
	isBookmarked := false
	for _, id := range user.BookmarkedMovieIDs {
		if id == movieObjectID {
			isBookmarked = true
			break
		}
	}

	var update bson.M
	var message string

	if isBookmarked {
		update = bson.M{"$pull": bson.M{"bookmarked_movie_ids": movieId}}
		message = "Movie removed from bookmarks."
	} else {
		update = bson.M{"$addToSet": bson.M{"bookmarked_movie_ids": movieId}}
		message = "Movie added to bookmarks."
	}

	_, err = userCollection.UpdateOne(ctx, bson.M{"user_id": userId}, update)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update bookmarks."})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"message": message})
}

// UploadUserAvatar handles avatar upload
func UploadUserAvatar(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	userId, ok := middleware.GetUserIdFromLocals(c)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized user found."})
	}

	file, err := c.FormFile("avatar")
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Avatar file is required"})
	}

	src, err := file.Open()
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Failed to open file"})
	}
	defer src.Close()

	// Decode and resize
	img, _, err := image.Decode(src)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid image file"})
	}

	resized := resize.Resize(256, 0, img, resize.Lanczos3)
	var buf bytes.Buffer
	if err := jpeg.Encode(&buf, resized, &jpeg.Options{Quality: 80}); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to encode image"})
	}

	databaseName := os.Getenv("DATABASE_NAME")
	db := client.Database(databaseName)
	bucket := db.GridFSBucket()

	// Check if user already has an avatar
	userCollection := database.OpenCollection("users", client)

	var existing models.User
	err = userCollection.FindOne(ctx, bson.M{"user_id": userId}).Decode(&existing)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
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
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to upload avatar"})
	}

	// Update user's avatar info
	update := bson.M{"$set": bson.M{
		"avatar_url": objectID.Hex(),
		"updated_at": time.Now(),
	}}

	_, err = userCollection.UpdateOne(ctx, bson.M{"user_id": userId}, update)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update user avatar"})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"message": "Avatar uploaded successfully"})
}

// GetExpertHelp provides AI-powered movie expert assistance
func GetExpertHelp(c *fiber.Ctx) error {
	key := os.Getenv("GROQ_API_KEY")
	if key == "" {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "missing GROQ_API_KEY"})
	}

	var req models.ChatRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	ctx := context.Background()

	llm, err := openai.New(
		openai.WithToken(key),
		openai.WithModel("llama-3.3-70b-versatile"),
		openai.WithBaseURL("https://api.groq.com/openai/v1"),
	)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	systemPrompt := `You are a movie expert. 
		Only answer questions strictly related to movies, actors, directors, film production, reviews, genres, or cinema history.
		If the user asks about anything outside movies, respond briefly with:
		"I'm sorry, I can only discuss topics related to movies." 
		Keep your answers short and to the point (3-4 sentences max).`

	chatContext := systemPrompt + "\n\n"
	for _, m := range req.Messages {
		switch m.Role {
		case "user":
			chatContext += "User: " + m.Content + "\n"
		case "assistant":
			chatContext += "Expert: " + m.Content + "\n"
		}
	}
	chatContext += "Expert:"

	resp, err := llm.Call(ctx, chatContext)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"response": resp})
}

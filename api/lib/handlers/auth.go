package handlers

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/pawanpdn-671/vstream/api/lib/database"
	"github.com/pawanpdn-671/vstream/api/lib/models"
	"github.com/pawanpdn-671/vstream/api/lib/utils"
	"go.mongodb.org/mongo-driver/v2/bson"
	"golang.org/x/crypto/bcrypt"
)

var validate = validator.New()

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

// isProd checks if we're in production mode
func isProd() bool {
	return os.Getenv("VERCEL_ENV") == "production" || os.Getenv("GIN_MODE") == "release"
}

// RegisterUser handles user registration
func RegisterUser(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	var user models.User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input data"})
	}

	if err := validate.Struct(user); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error":   "Input validation failed",
			"details": err.Error(),
		})
	}

	hashedPassword, err := HashPassword(user.Password)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Unable to hash password"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	userCollection := database.OpenCollection("users", client)
	count, err := userCollection.CountDocuments(ctx, bson.M{"email": user.Email})
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to check existing user"})
	}

	if count > 0 {
		return c.Status(http.StatusConflict).JSON(fiber.Map{"error": "User already exists!"})
	}

	user.UserID = bson.NewObjectID().Hex()
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	user.Password = hashedPassword

	result, err := userCollection.InsertOne(ctx, user)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create user"})
	}

	return c.Status(http.StatusCreated).JSON(result)
}

// LoginUser handles user login
func LoginUser(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	var userLogin models.UserLogin
	if err := c.BodyParser(&userLogin); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid login data"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	var foundUser models.User
	userCollection := database.OpenCollection("users", client)
	err = userCollection.FindOne(ctx, bson.M{"email": userLogin.Email}).Decode(&foundUser)
	if err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid email or password"})
	}

	err = bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(userLogin.Password))
	if err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid email or password"})
	}

	token, refreshToken, err := utils.GenerateAllToken(
		foundUser.Email,
		foundUser.FirstName,
		foundUser.LastName,
		foundUser.Role,
		foundUser.UserID,
	)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate tokens"})
	}

	prod := isProd()
	sameSite := "Lax"
	if prod {
		sameSite = "None"
	}

	// Set access token cookie
	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    token,
		Path:     "/",
		MaxAge:   int(utils.TokenExpirationTime.Seconds()),
		Secure:   prod,
		HTTPOnly: true,
		SameSite: sameSite,
	})

	// Set refresh token cookie
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		Path:     "/",
		MaxAge:   int(utils.RefreshTokenExpirationTime.Seconds()),
		Secure:   prod,
		HTTPOnly: true,
		SameSite: sameSite,
	})

	return c.Status(http.StatusOK).JSON(models.UserResponse{
		Email:  foundUser.Email,
		UserId: foundUser.UserID,
	})
}

// LogoutHandler handles user logout
func LogoutHandler(c *fiber.Ctx) error {
	prod := isProd()
	sameSite := "Lax"
	if prod {
		sameSite = "None"
	}

	// Clear access token cookie
	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		Secure:   prod,
		HTTPOnly: true,
		SameSite: sameSite,
	})

	// Clear refresh token cookie
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		Secure:   prod,
		HTTPOnly: true,
		SameSite: sameSite,
	})

	return c.Status(http.StatusOK).JSON(fiber.Map{"message": "Logged out successfully"})
}

// RefreshTokenHandler handles token refresh
func RefreshTokenHandler(c *fiber.Ctx) error {
	client, err := database.GetClient()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database connection failed"})
	}

	refreshToken := c.Cookies("refresh_token")
	if refreshToken == "" {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Unable to retrieve refresh token from cookie"})
	}

	claim, err := utils.ValidateRefreshToken(refreshToken)
	if err != nil || claim == nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid or expired refresh token"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	userCollection := database.OpenCollection("users", client)
	var user models.User
	err = userCollection.FindOne(ctx, bson.D{{Key: "user_id", Value: claim.UserId}}).Decode(&user)
	if err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "User not found"})
	}

	newToken, newRefreshToken, err := utils.GenerateAllToken(
		user.Email,
		user.FirstName,
		user.LastName,
		user.Role,
		user.UserID,
	)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate tokens"})
	}

	prod := isProd()
	sameSite := "Lax"
	if prod {
		sameSite = "None"
	}

	// Set new access token cookie
	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    newToken,
		Path:     "/",
		MaxAge:   int(utils.TokenExpirationTime.Seconds()),
		Secure:   prod,
		HTTPOnly: true,
		SameSite: sameSite,
	})

	// Set new refresh token cookie
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    newRefreshToken,
		Path:     "/",
		MaxAge:   int(utils.RefreshTokenExpirationTime.Seconds()),
		Secure:   prod,
		HTTPOnly: true,
		SameSite: sameSite,
	})

	return c.Status(http.StatusOK).JSON(fiber.Map{"message": "Tokens refreshed"})
}

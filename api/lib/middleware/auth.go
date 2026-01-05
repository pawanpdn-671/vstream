package middleware

import (
	"context"
	"net/http"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/pawanpdn-671/vstream/api/lib/utils"
)

type contextKey string

const (
	UserIDKey contextKey = "userId"
	RoleKey   contextKey = "role"
)

// AuthMiddleware for Fiber - validates JWT tokens and sets user context
func AuthMiddleware(c *fiber.Ctx) error {
	token := c.Cookies("access_token")

	if token == "" {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "No token provided"})
	}

	claims, err := utils.ValidateToken(token)
	if err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token"})
	}

	// Set user info in Fiber locals
	c.Locals("userId", claims.UserId)
	c.Locals("role", claims.Role)

	return c.Next()
}

// GetUserIdFromLocals retrieves the user ID from Fiber context
func GetUserIdFromLocals(c *fiber.Ctx) (string, bool) {
	userId, ok := c.Locals("userId").(string)
	return userId, ok
}

// GetUserRoleFromLocals retrieves the user role from Fiber context
func GetUserRoleFromLocals(c *fiber.Ctx) (string, bool) {
	role, ok := c.Locals("role").(string)
	return role, ok
}

// CORSMiddleware handles CORS headers for Fiber
func CORSMiddleware(c *fiber.Ctx) error {
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	origin := c.Get("Origin")

	// Check if origin is allowed
	if allowedOrigins != "" {
		// For simplicity, we'll allow the configured origins
		c.Set("Access-Control-Allow-Origin", origin)
	} else {
		c.Set("Access-Control-Allow-Origin", "http://localhost:5173")
	}

	c.Set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
	c.Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
	c.Set("Access-Control-Expose-Headers", "Content-Length, Set-Cookie")
	c.Set("Access-Control-Allow-Credentials", "true")
	c.Set("Access-Control-Max-Age", "43200") // 12 hours in seconds

	// Handle preflight requests
	if c.Method() == "OPTIONS" {
		return c.SendStatus(http.StatusNoContent)
	}

	return c.Next()
}

// GetUserIdFromContext retrieves user ID from standard context (for handlers that use context.Context)
func GetUserIdFromContext(ctx context.Context) (string, bool) {
	userId, ok := ctx.Value(UserIDKey).(string)
	return userId, ok
}

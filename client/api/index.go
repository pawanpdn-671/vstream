package handler

import (
	"net/http"
	"os"
	"strings"

	"github.com/gofiber/adaptor/v2"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/pawanpdn-671/vstream/api/lib/handlers"
	"github.com/pawanpdn-671/vstream/api/lib/middleware"
)

var app *fiber.App

func init() {
	app = fiber.New(fiber.Config{
		// Disable startup message for serverless
		DisableStartupMessage: true,
	})

	// Setup middleware
	setupMiddleware()

	// Setup routes
	setupRoutes()
}

func setupMiddleware() {
	// Logger
	app.Use(logger.New())

	// CORS
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		allowedOrigins = "http://localhost:5173"
	}

	app.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     "GET,POST,PATCH,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization",
		ExposeHeaders:    "Content-Length,Set-Cookie",
		AllowCredentials: true,
		MaxAge:           43200, // 12 hours
	}))
}

func setupRoutes() {
	// API prefix group
	api := app.Group("/api")

	// Health check
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "message": "VStream API is running"})
	})

	// =====================
	// PUBLIC ROUTES (no auth required)
	// =====================

	// Auth routes
	api.Post("/register", handlers.RegisterUser)
	api.Post("/login", handlers.LoginUser)
	api.Post("/logout", handlers.LogoutHandler)
	api.Post("/refresh", handlers.RefreshTokenHandler)

	// Public movie routes
	api.Get("/movies", handlers.GetMovies)
	api.Get("/genres", handlers.GetGenres)

	// =====================
	// PROTECTED ROUTES (auth required)
	// =====================
	protected := api.Group("", middleware.AuthMiddleware)

	// User routes
	protected.Get("/me", handlers.GetCurrentUser)
	protected.Get("/users/:user_id/avatar", handlers.GetUserAvatar)
	protected.Get("/me/bookmarked_movies", handlers.GetBookmarkedMovies)
	protected.Get("/me/liked_movies", handlers.GetLikedMovies)
	protected.Get("/me/reviews", handlers.GetUserReviews)
	protected.Post("/movie/expert-help", handlers.GetExpertHelp)
	protected.Post("/me/update", handlers.UpdateUser)
	protected.Post("/me/upload_avatar", handlers.UploadUserAvatar)
	protected.Post("/me/change_password", handlers.UpdatePassword)
	protected.Post("/bookmark/:movieId", handlers.ToggleBookmarkMovie)

	// Protected movie routes
	protected.Get("/movie/:imdb_id", handlers.GetMovie)
	protected.Post("/movie/add", handlers.AddMovie)
	protected.Get("/recommended_movies", handlers.GetRecommendedMovies)
	protected.Post("/movie/user_story/wai", handlers.GenerateMovieFromStory)
	protected.Patch("/movie/:id/update", handlers.UpdateMovie)
	protected.Delete("/movie/:id/delete", handlers.DeleteMovie)
	protected.Patch("/movies/:imdb_id/reaction", handlers.LikeOrDislikeMovie)

	// Review routes
	protected.Get("/movies/:imdb_id/reviews", handlers.GetReviewsByMovie)
	protected.Get("/movies/:imdb_id/reviews/topics", handlers.GetPopularWords)
	protected.Post("/movies/:imdb_id/add_review", handlers.AddReview)
}

// Handler is the serverless entry point
func Handler(w http.ResponseWriter, r *http.Request) {
	// Strip /api prefix if it exists (Vercel adds it automatically)
	if !strings.HasPrefix(r.URL.Path, "/api") {
		r.URL.Path = "/api" + r.URL.Path
	}

	// CRITICAL: Set RequestURI for Fiber adaptor to properly parse query parameters
	// Vercel's serverless environment doesn't set this field, causing c.Query() to return empty strings
	r.RequestURI = r.URL.RequestURI()

	// Use Fiber's adaptor to convert http.Handler to Fiber
	adaptor.FiberApp(app)(w, r)
}

package movie

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/tmc/langchaingo/llms/openai"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func GenerateMovieFromStory(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		err := godotenv.Load(".env")
		if err != nil {
			log.Println("Warning: .env file is missing")
		}

		var req struct {
			Story string `json:"story"`
		}

		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		groqApiKey := os.Getenv("GROQ_API_KEY")

		if groqApiKey == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "api key is missing"})
			return
		}

		llm, err := openai.New(
			openai.WithToken(groqApiKey),
			openai.WithBaseURL("https://api.groq.com/openai/v1"),
			openai.WithModel("llama-3.3-70b-versatile"),
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		base_prompt_template := os.Getenv("GET_MOVIE_PROMPT_TEMPLATE")
		prompt := fmt.Sprintf(`%v
		{
		"imdb_id": "string",
		"title": "string",
		"poster_path": "string (a poster image URL)",
		"youtube_id": "string (youtube trailer ID)",
		"plot": "string"
		}

		User story:
		%s
		`, base_prompt_template, req.Story)

		response, err := llm.Call(c, prompt)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		re := regexp.MustCompile("(?s)```json(.*?)```")
		matches := re.FindStringSubmatch(response)
		clean := response
		if len(matches) > 1 {
			clean = matches[1]
		}
		clean = strings.TrimSpace(clean)

		// 🧾 Parse JSON if possible
		var parsed interface{}
		if err := json.Unmarshal([]byte(clean), &parsed); err != nil {
			// If parsing fails, just return raw string for debugging
			c.JSON(http.StatusOK, gin.H{"raw": clean, "error": "failed to parse JSON"})
			return
		}

		c.JSON(http.StatusOK, parsed)
	}
}

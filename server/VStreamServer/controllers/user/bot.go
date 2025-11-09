package user

import (
	"context"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/tmc/langchaingo/llms/openai"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Messages []ChatMessage `json:"messages"`
}

func GetExpertHelp(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := context.Background()

		key := os.Getenv("GROQ_API_KEY")
		if key == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "missing GROQ_API_KEY"})
			return
		}

		var req ChatRequest
		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
			return
		}

		llm, err := openai.New(
			openai.WithToken(key),
			openai.WithModel("llama-3.3-70b-versatile"),
			openai.WithBaseURL("https://api.groq.com/openai/v1"),
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
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
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"response": resp})
	}
}

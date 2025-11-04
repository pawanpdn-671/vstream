package movie

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/database"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/models"
	"github.com/pawanpdn-671/vstream/server/VStreamServer/utils"
	"github.com/tmc/langchaingo/llms/openai"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type YouTubeSearchResponse struct {
	Items []struct {
		ID struct {
			VideoID string `json:"videoId"`
		} `json:"id"`
	} `json:"items"`
}

type Genre struct {
	GenreID   int    `json:"genre_id"`
	GenreName string `json:"genre_name"`
}

func GetYouTubeVideoID(c *gin.Context, title string) (interface{}, error) {
	apiKey := os.Getenv("YOUTUBE_API_KEY")
	if apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "missing youtube API config"})
		return nil, fmt.Errorf("missing youtube API config")
	}
	baseURL := "https://www.googleapis.com/youtube/v3/search"

	query := url.QueryEscape(fmt.Sprintf("%s trailer", title))
	requestURL := fmt.Sprintf("%s?part=snippet&type=video&maxResults=1&q=%s&key=%s",
		baseURL, query, apiKey)

	resp, err := http.Get(requestURL)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result YouTubeSearchResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	if len(result.Items) == 0 {
		return "", fmt.Errorf("no videos found")
	}

	return result.Items[0].ID.VideoID, nil
}

func GetMovieByTitle(c *gin.Context, title string) (interface{}, error) {
	if title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "movie title is required"})
		return nil, fmt.Errorf("missing title")
	}

	collectURL := os.Getenv("COLLECT_BASE_URL")
	apiKey := os.Getenv("COLLECT_API_KEY")
	if collectURL == "" || apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "missing collect API config"})
		return nil, fmt.Errorf("missing collect API config")
	}

	fullURL := strings.Replace(collectURL, "{title}", url.QueryEscape(title), 1)

	req, err := http.NewRequest("GET", fullURL, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create request"})
		return nil, err
	}

	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", apiKey)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to send request"})
		return nil, err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read response"})
		return nil, err
	}

	var parsed struct {
		Success bool                     `json:"success"`
		Result  []map[string]interface{} `json:"result"`
	}

	if err := json.Unmarshal(body, &parsed); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"raw":     string(body),
			"warning": "failed to parse JSON response",
		})
		return nil, fmt.Errorf("failed to parse JSON: %v", err)
	}

	movie := map[string]interface{}{
		"title":       title,
		"poster_path": "",
		"imdb_id":     "",
	}

	if len(parsed.Result) > 0 {
		r := parsed.Result[0]
		if t, ok := r["title"].(string); ok && t != "" {
			movie["title"] = t
		}
		if p, ok := r["poster"].(string); ok {
			movie["poster_path"] = p
		}
		if id, ok := r["imdb_id"].(string); ok {
			movie["imdb_id"] = id
		}
	}

	if movie["poster"] == "" || movie["imdb_id"] == "" {
		omdbAPIKey := os.Getenv("OMDB_API_KEY")
		if omdbAPIKey != "" {
			omdbURL := fmt.Sprintf("http://www.omdbapi.com/?apikey=%s&t=%s", omdbAPIKey, url.QueryEscape(title))
			resp, err := http.Get(omdbURL)
			if err != nil {
				log.Printf("OMDb request failed for '%s': %v", title, err)
			} else {
				defer resp.Body.Close()

				if resp.StatusCode == http.StatusOK {
					var omdbData map[string]interface{}
					if err := json.NewDecoder(resp.Body).Decode(&omdbData); err != nil {
						log.Printf("Failed to parse OMDb JSON for '%s': %v", title, err)
					} else {
						if responseVal, ok := omdbData["Response"].(string); ok && strings.EqualFold(responseVal, "False") {
							log.Printf("OMDb API returned error for '%s': %v", title, omdbData["Error"])
						} else {
							if poster, ok := omdbData["Poster"].(string); ok && poster != "N/A" {
								movie["poster_path"] = poster
							}
							if imdbID, ok := omdbData["imdbID"].(string); ok && imdbID != "N/A" {
								movie["imdb_id"] = imdbID
							}
						}
					}
				} else {
					log.Printf("OMDb API HTTP error for '%s': %d", title, resp.StatusCode)
				}
			}
		} else {
			log.Println("Warning: OMDB_API_KEY missing — cannot fetch OMDb fallback")
		}
	}

	return movie, nil
}

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
		genrePath := filepath.Join("data", "genres.json")
		genreBytes, err := os.ReadFile(genrePath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read genres.json"})
			return
		}

		var genres []Genre

		if err := json.Unmarshal(genreBytes, &genres); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse genres.json"})
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
		genreJSON, _ := json.MarshalIndent(genres, "", "  ")
		prompt := fmt.Sprintf(`%v
		Example:
		[
			{
			"title": "string",
			"plot": "string",
			"genre": "[{ genre_name: "string", genre_id: "int"}]"
			}
		]

		RULES:
		- Genres MUST ONLY come from this list.
		- genre_name and genre_id must match exactly.

		Allowed genres:
		%s
		
		User story:
		%s
		`, base_prompt_template, string(genreJSON), req.Story)

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

		var movies []map[string]interface{}
		if err := json.Unmarshal([]byte(clean), &movies); err != nil {
			c.JSON(http.StatusOK, gin.H{"raw": clean, "error": "failed to parse JSON"})
			return
		}

		var mergedMovies []interface{}

		for _, movie := range movies {
			title, ok := movie["title"].(string)
			if !ok || title == "" {
				continue
			}
			var movieRateLimiter = time.Tick(1 * time.Second)
			<-movieRateLimiter
			// Rate-limited call: 1 request per second
			movieData, err := GetMovieByTitle(c, title)
			if err != nil {
				log.Printf("Failed to fetch movie for title %s: %v", title, err)
				continue
			}

			apiMovie, ok := movieData.(map[string]interface{})
			if !ok {
				continue
			}
			var youtubeRateLimiter = time.Tick(1 * time.Second)
			<-youtubeRateLimiter
			youtubeID, err := GetYouTubeVideoID(c, title)

			if err != nil {
				log.Printf("Failed to get YouTube video for %s: %v", title, err)
				apiMovie["youtube_id"] = ""
			} else {
				apiMovie["youtube_id"] = youtubeID
			}

			apiMovie["plot"] = movie["plot"]
			apiMovie["genre"] = movie["genre"]

			mergedMovies = append(mergedMovies, apiMovie)
		}
		var movieCollection *mongo.Collection = database.OpenCollection("movies", client)

		for _, m := range mergedMovies {
			movieMap, ok := m.(map[string]interface{})
			if !ok {
				continue
			}

			var genres []models.Genre
			if rawGenres, ok := movieMap["genre"].([]interface{}); ok {
				for _, g := range rawGenres {
					if gm, ok := g.(map[string]interface{}); ok {
						genre := models.Genre{}
						if name, ok := gm["genre_name"].(string); ok {
							genre.GenreName = name
						}
						if id, ok := gm["genre_id"].(float64); ok {
							genre.GenreID = int(id)
						}
						genres = append(genres, genre)
					}
				}
			}

			movie := models.Movie{
				ImdbID:     utils.GetString(movieMap, "imdb_id"),
				Title:      utils.GetString(movieMap, "title"),
				PosterPath: utils.GetString(movieMap, "poster_path"),
				YoutubeID:  utils.GetString(movieMap, "youtube_id"),
				Genre:      genres,
				Plot:       utils.GetString(movieMap, "plot"),
			}

			var existing models.Movie
			err := movieCollection.FindOne(c, bson.M{"imdb_id": movie.ImdbID}).Decode(&existing)
			if err == nil {
				log.Printf("Skipping existing movie: %s (%s)", movie.Title, movie.ImdbID)
				continue
			}

			_, err = movieCollection.InsertOne(c, movie)
			if err != nil {
				log.Printf("Failed to insert movie '%s': %v", movie.Title, err)
				continue
			}
		}

		c.JSON(http.StatusOK, mergedMovies)
	}
}

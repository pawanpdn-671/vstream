package utils

import (
	"encoding/json"
	"net/http"
)

// JSON sends a JSON response with the given status code and data
func JSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// Error sends an error response in JSON format
func Error(w http.ResponseWriter, status int, message string) {
	JSON(w, status, map[string]string{"error": message})
}

// H is a shortcut for creating a map[string]interface{} (similar to gin.H)
type H map[string]interface{}

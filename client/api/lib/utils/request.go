package utils

import (
	"encoding/json"
	"io"
	"net/http"
	"slices"
	"strconv"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// BindJSON decodes the request body into the provided struct
func BindJSON(r *http.Request, v interface{}) error {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		return err
	}
	defer r.Body.Close()

	return json.Unmarshal(body, v)
}

// GetQueryParam returns a query parameter value with a default fallback
func GetQueryParam(r *http.Request, key, defaultValue string) string {
	value := r.URL.Query().Get(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// GetQueryParamInt returns a query parameter as an integer with a default fallback
func GetQueryParamInt(r *http.Request, key string, defaultValue int) (int, error) {
	value := r.URL.Query().Get(key)
	if value == "" {
		return defaultValue, nil
	}
	return strconv.Atoi(value)
}

// GetString extracts a string from a map
func GetString(m map[string]interface{}, key string) string {
	if v, ok := m[key]; ok {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}

// ContainsObjectID checks if a slice contains an ObjectID
func ContainsObjectID(arr []bson.ObjectID, id bson.ObjectID) bool {
	return slices.Contains(arr, id)
}

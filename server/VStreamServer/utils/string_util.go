package utils

import (
	"slices"

	"go.mongodb.org/mongo-driver/v2/bson"
)

func GetString(m map[string]interface{}, key string) string {
	if v, ok := m[key]; ok {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}

func ContainsObjectID(arr []bson.ObjectID, id bson.ObjectID) bool {
	return slices.Contains(arr, id)
}

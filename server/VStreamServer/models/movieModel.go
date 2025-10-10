package model

import (
	"go.mongodb.org/mongo-driver/v2/bson"
)

type Movie struct {
	ID bson.ObjectID
	ImdbID string
	
}
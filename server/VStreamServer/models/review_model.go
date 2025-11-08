package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type ReviewUser struct {
	UserID    string `bson:"user_id" json:"user_id" validate:"required"`
	FirstName string `bson:"first_name" json:"first_name" validate:"required"`
	LastName  string `bson:"last_name" json:"last_name" validate:"required"`
}

type Review struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	MovieID   bson.ObjectID `bson:"movie_id" json:"movie_id" validate:"required"`
	ImdbID    string        `bson:"imdb_id" json:"imdb_id" validate:"required"`
	User      ReviewUser    `bson:"user" json:"user" validate:"required,dive"`
	Rating    float64       `bson:"rating" json:"rating"`
	Comment   string        `bson:"comment" json:"comment" validate:"required,min=3,max=1000"`
	CreatedAt time.Time     `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time     `bson:"updated_at" json:"updated_at"`
}

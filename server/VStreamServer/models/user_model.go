package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type User struct {
	ID                 bson.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	UserID             string        `json:"user_id" bson:"user_id"`
	FirstName          string        `json:"first_name" bson:"first_name" validate:"required,min=2,max=100"`
	LastName           string        `json:"last_name" bson:"last_name" validate:"required,min=2,max=100"`
	Email              string        `json:"email" bson:"email" validate:"required,email"`
	Password           string        `json:"password" bson:"password" validate:"required,min=6"`
	Role               string        `json:"role" bson:"role" validate:"oneof=ADMIN USER"`
	CreatedAt          time.Time     `json:"created_at" bson:"created_at"`
	UpdatedAt          time.Time     `json:"updated_at" bson:"updated_at"`
	FavouriteGenres    []Genre       `json:"favourite_genres" bson:"favourite_genres" validate:"required,dive"`
	BookmarkedMovieIDs []string      `json:"bookmarked_movie_ids,omitempty" bson:"bookmarked_movie_ids,omitempty"`
}

type UserLogin struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

type UserResponse struct {
	UserId string `json:"user_id"`
	Email  string `json:"email"`
}

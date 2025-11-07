package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Genre struct {
	GenreID   int    `bson:"genre_id" json:"genre_id" validate:"required"`
	GenreName string `bson:"genre_name" json:"genre_name" validate:"required,min=2,max=100"`
}
type UploadedUser struct {
	UserID    string `bson:"user_id" json:"user_id" validate:"required"`
	FirstName string `bson:"first_name" json:"first_name" validate:"required"`
	LastName  string `bson:"last_name" json:"last_name" validate:"required"`
}

type Movie struct {
	ID         bson.ObjectID   `bson:"_id,omitempty" json:"_id,omitempty"`
	ImdbID     string          `bson:"imdb_id" json:"imdb_id" validate:"required"`
	Title      string          `bson:"title" json:"title" validate:"required,min=2,max=500"`
	PosterPath string          `bson:"poster_path" json:"poster_path" validate:"required,url"`
	YoutubeID  string          `bson:"youtube_id" json:"youtube_id" validate:"required"`
	Genre      []Genre         `bson:"genre" json:"genre" validate:"required,dive"`
	Plot       string          `bson:"plot" json:"plot" validate:"required"`
	Likes      int             `bson:"likes" json:"likes"`
	Dislikes   int             `bson:"dislikes" json:"dislikes"`
	LikedBy    []bson.ObjectID `bson:"liked_by,omitempty" json:"liked_by,omitempty"`
	DislikedBy []bson.ObjectID `bson:"disliked_by,omitempty" json:"disliked_by,omitempty"`
	CreatedAt  time.Time       `json:"created_at" bson:"created_at"`
	UpdatedAt  time.Time       `json:"updated_at" bson:"updated_at"`
	UploadedBy UploadedUser    `json:"uploaded_by" bson:"uploaded_by"`
}

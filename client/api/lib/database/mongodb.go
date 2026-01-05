package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var (
	clientInstance *mongo.Client
	clientOnce     sync.Once
	clientErr      error
)

// GetClient returns a singleton MongoDB client optimized for serverless environments.
// Uses sync.Once to ensure the connection is only established once per cold start.
func GetClient() (*mongo.Client, error) {
	clientOnce.Do(func() {
		mongoURI := os.Getenv("MONGODB_URI")
		if mongoURI == "" {
			clientErr = fmt.Errorf("MONGODB_URI environment variable is not set")
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Configure client with serverless-optimized settings
		clientOptions := options.Client().
			ApplyURI(mongoURI).
			SetMaxPoolSize(10). // Limit connections for serverless
			SetMinPoolSize(1)

		client, err := mongo.Connect(clientOptions)
		if err != nil {
			clientErr = fmt.Errorf("failed to connect to MongoDB: %w", err)
			return
		}

		// Verify connection
		if err := client.Ping(ctx, nil); err != nil {
			clientErr = fmt.Errorf("failed to ping MongoDB: %w", err)
			return
		}

		log.Println("Connected to MongoDB successfully")
		clientInstance = client
	})

	return clientInstance, clientErr
}

// OpenCollection returns a collection from the database
func OpenCollection(collectionName string, client *mongo.Client) *mongo.Collection {
	databaseName := os.Getenv("DATABASE_NAME")
	if databaseName == "" {
		databaseName = "vstream" // fallback default
	}
	return client.Database(databaseName).Collection(collectionName)
}

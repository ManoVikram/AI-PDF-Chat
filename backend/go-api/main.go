package main

import (
	"log"
	"os"

	"github.com/ManoVikram/AI-PDF-Chat/backend/go-api/routes"
	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	// Connect to Python gRPC server
	connection, err := grpc.NewClient("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}
	defer connection.Close()
	
	// Step up Gin server
	server := gin.Default()
	
	server.RedirectTrailingSlash = true
	
	// Register routes
	routes.RegisterRoutes(server)
	
	// Start the Gin server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(server.Run(":" + port))
}

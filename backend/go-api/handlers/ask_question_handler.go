package handlers

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/ManoVikram/AI-PDF-Chat/backend/go-api/models"
	pb "github.com/ManoVikram/AI-PDF-Chat/backend/go-api/pdfchat"
	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func AskQuestionHandler(c *gin.Context) {
	var request models.Question

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Question is required"})
		return
	}

	// Connect to Python gRPC server
	connection, err := grpc.NewClient("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("Failed to connect to Python service: %v", err)
	}
	defer connection.Close()

	client := pb.NewPDFServiceClient(connection)

	// Call Python gRPC service to get answer
	answer, err := client.AskQuestion(context.Background(), &pb.AskQuestionRequest{
		Question: request.Question,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to get answer from Python service - %v", err.Error())})
		return
	}

	c.JSON(http.StatusOK, gin.H{"answer": answer.Answer})
}

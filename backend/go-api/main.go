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
	
	// client := pb.NewPDFServiceClient(connection)

	// pdfRequest := &pb.UploadPDFRequest{
	// 	PdfName:    "sample.pdf",
	// 	PdfContent: []byte("dummy PDF data"),
	// }
	// response, err := client.UploadPDF(context.Background(), pdfRequest)
	// if err != nil {
	// 	log.Fatalf("Error uploading PDF: %v", err)
	// }

	// log.Printf("Upload PDF Response: %s", response.Status)

	// questionRequest := &pb.AskQuestionRequest{Question: "What is this PDF about?"}
	// answer, err := client.AskQuestion(context.Background(), questionRequest)
	// if err != nil {
	// 	log.Fatalf("Error asking question: %v", err)
	// }

	// log.Printf("Answer: %s", answer.Answer)
}

package handlers

import (
	"context"
	"fmt"
	"log"
	"net/http"

	pb "github.com/ManoVikram/AI-PDF-Chat/backend/go-api/pdfchat"
	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func UploadPDFHandler(c *gin.Context) {
	file, err := c.FormFile("pdf")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "PDF file is required"})
		return
	}

	pdfFile, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open PDF file"})
		return
	}
	defer pdfFile.Close()

	pdfBytes := make([]byte, file.Size)
	_, err = pdfFile.Read(pdfBytes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read PDF file"})
		return
	}

	// Connect to Python gRPC server
	connection, err := grpc.NewClient("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("Failed to connect to Python service: %v", err)
	}
	defer connection.Close()

	client := pb.NewPDFServiceClient(connection)

	// Call Python gRPC service to upload PDF
	response, err := client.UploadPDF(context.Background(), &pb.UploadPDFRequest{
		PdfName:    file.Filename,
		PdfContent: pdfBytes,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to upload PDF to Python service %s", err.Error())})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": response.Status})
}

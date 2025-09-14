package routes

import (
	"github.com/ManoVikram/AI-PDF-Chat/backend/go-api/handlers"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(server *gin.Engine) {
	// Upload PDF files endpoint
	server.POST("/upload", handlers.UploadPDFHandler)

	// Ask questions about the uploaded PDFs endpoint
	server.POST("/ask", handlers.AskQuestionHandler)
}

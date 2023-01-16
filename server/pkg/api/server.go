package api

import (
	"scrabble/pkg/api/services"

	"github.com/gofiber/fiber/v2"
)

type Server struct {
	// db *db
	App         *fiber.App
	GameService *services.GameService
}

func NewServer() *Server {
	s := &Server{
		App:         fiber.New(),
		GameService: &services.GameService{},
	}

	s.setupMiddleware()
	s.setupRoutes()

	return s
}

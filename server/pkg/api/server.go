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

func (s *Server) handleAvatorUpload() fiber.Handler {
	return func(c *fiber.Ctx) error {
		return c.SendString("vous avez televerser votre avatar")
	}
}

func (s *Server) handleCreateGame() fiber.Handler {
	return func(c *fiber.Ctx) error {
		s.GameService.StartGame()
		return c.SendString("game has started")
	}
}

func (s *Server) handleJoinGame() fiber.Handler {
	return func(c *fiber.Ctx) error {
		return c.SendString("you have join the game")
	}
}

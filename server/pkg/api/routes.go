package api

import "github.com/gofiber/fiber/v2"

func (s *Server) setupRoutes() {
	s.App.Get("/ws", s.WebSocketManager.Accept())

	api := s.App.Group("/api")
	api.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello api")
	})

	api.Post("/db/avatar", s.AccountHandler.UploadAvatar())

	s.setupGameRoutes()
}

func (s *Server) setupGameRoutes() {
	game := s.App.Group("/api/game")
	game.Post("/start", s.GameHandler.CreateGame())
	game.Post("/join", s.GameHandler.JoinGame())
}

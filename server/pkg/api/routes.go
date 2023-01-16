package api

import "scrabble/pkg/api/handlers"

func (s *Server) setupRoutes() {
	api := s.App.Group("/api")
	api.Post("/db/avatar", handlers.UploadAvatar())

	s.setupGameRoutes()
}

func (s *Server) setupGameRoutes() {
	game := s.App.Group("/api/game")
	game.Post("/start", handlers.CreateGame(s.GameService))
	game.Post("/join", handlers.JoinGame())
}

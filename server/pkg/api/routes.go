package api

func (s *Server) setupRoutes() {
	api := s.App.Group("/api")
	api.Post("/db/avatar", s.handleAvatorUpload())

	s.setupGameRoutes()
}

func (s *Server) setupGameRoutes() {
	game := s.App.Group("/api/game")
	game.Post("/start", s.handleCreateGame())
	game.Post("/join", s.handleJoinGame())
}

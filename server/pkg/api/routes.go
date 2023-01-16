package api

func (s *Server) setupRoutes() {
	api := s.App.Group("/api")
	api.Post("/db/avatar", s.AccountHandler.UploadAvatar())

	s.setupGameRoutes()
}

func (s *Server) setupGameRoutes() {
	game := s.App.Group("/api/game")
	game.Post("/start", s.GameHandler.CreateGame())
	game.Post("/join", s.GameHandler.JoinGame())
}

package api

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/monitor"
)

func (api *API) setupMiddleware() {
	api.App.Use(cors.New())
	api.App.Use(limiter.New(limiter.Config{Max: 500, Expiration: 30 * time.Second}))
	api.App.Use(logger.New(logger.Config{
		Format: "[${ip}]:${port} ${status} - ${method} ${path}\n",
	}))
	api.App.Get("/metrics", monitor.New(monitor.Config{Title: "Scrabble Server Metrics"}))
}

func (s *API) setupRoutes() {
	s.App.Get("/metrics", monitor.New(monitor.Config{Title: "Scrabble Server Metrics"}))

	s.App.Get("/ws", s.WebSocketManager.Accept())

	api := s.App.Group("/api")
	api.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello api")
	})

	api.Post("/db/avatar", s.AccountCtrl.UploadAvatar())

	s.setupGameRoutes()
}

func (api *API) setupGameRoutes() {
	game := api.App.Group("/api/game")
	game.Post("/start", api.GameCtrl.CreateGame())
	game.Post("/join", api.GameCtrl.JoinGame())
}

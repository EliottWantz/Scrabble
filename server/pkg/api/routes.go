package api

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/basicauth"
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

	s.App.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello api")
	})
	api := s.App.Group("/api")
	protected := api.Group("/").Use(basicauth.New(basicauth.Config{
		Users: map[string]string{
			"john":  "doe",
			"admin": "123456",
		},
	}))

	protected.Get("/user", func(c *fiber.Ctx) error {
		fmt.Println("user basic auth:", c.Get("Authorization"))
		fmt.Println("username:", c.Locals("username"))
		fmt.Println("password:", c.Locals("password"))
		return c.SendString("Hello user, you are allowed")
	})
}

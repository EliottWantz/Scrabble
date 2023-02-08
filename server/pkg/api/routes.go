package api

import (
	"net/http"
	"time"

	"scrabble/config"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/monitor"
)

func (api *API) setupMiddleware() {
	api.App.Use(
		cors.New(),
		limiter.New(
			limiter.Config{
				Max:        500,
				Expiration: 30 * time.Second,
			},
		),
		logger.New(
			logger.Config{
				Format:     "${time} | ${ip}:${port} | ${latency} | ${method} | ${status} | ${path}\n",
				TimeFormat: "2006/01/02 15:04:05",
			},
		),
	)

	api.App.Get("/metrics", monitor.New(monitor.Config{Title: "Scrabble Server Metrics"}))
}

func (api *API) setupRoutes(cfg *config.Config) {
	router := api.App.Group("/api")
	router.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello api")
	})
	router.Post("/login", api.UserCtrl.Login)
	router.Post("/logout", api.UserCtrl.Logout(api.WebSocketManager))

	ws := api.App.Group("/ws")
	ws.Get("/", func(c *fiber.Ctx) error {
		ID := c.Query("id")
		if ID == "" {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Missing id"})
		}
		return api.WebSocketManager.Accept(ID)(c)
	})
}

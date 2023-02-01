package api

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/monitor"
	jwtware "github.com/gofiber/jwt/v3"
)

func (api *API) setupMiddleware() {
	api.App.Use(cors.New())
	api.App.Use(limiter.New(limiter.Config{Max: 500, Expiration: 30 * time.Second}))
	api.App.Use(logger.New(logger.Config{
		Format: "[${ip}]:${port} ${status} - ${method} ${path}\n",
	}))
	api.App.Get("/metrics", monitor.New(monitor.Config{Title: "Scrabble Server Metrics"}))
}

func (api *API) setupRoutes() {
	api.App.Get("/ws", api.WebSocketManager.Accept())

	// Public routes
	router := api.App.Group("/api")
	router.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello api")
	})
	router.Post("/signup", api.UserCtrl.SignUp)
	router.Post("/login", api.UserCtrl.Login)

	// Proctected routes
	router.Use(
		jwtware.New(
			jwtware.Config{
				SigningKey: []byte("secret"),
				ContextKey: "token",
			},
		),
	)
	router.Post("/avatar", api.UserCtrl.UploadAvatar)
	router.Post("/revalidate", api.UserCtrl.Revalidate)
	router.Get("/user/:id", api.UserCtrl.GetUser)
}

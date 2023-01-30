package api

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/monitor"
	jwtware "github.com/gofiber/jwt/v3"
	"github.com/golang-jwt/jwt/v4"
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

	router := api.App.Group("/api")

	router.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello api")
	})
	router.Get("/accessible", accessible)
	router.Post("/login", api.UserCtrl.Login)
	router.Post("/signup", api.UserCtrl.SignUp)
	router.Post("/revalidate", api.UserCtrl.Revalidate)
	r := router.Group("/restricted").Use(
		jwtware.New(
			jwtware.Config{
				SigningKey: []byte("secret"),
				ContextKey: "token",
			},
		),
	)
	r.Get("/", restricted)
}

func accessible(c *fiber.Ctx) error {
	return c.SendString("Accessible")
}

func restricted(c *fiber.Ctx) error {
	token := c.Locals("token").(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)
	username := claims["username"].(string)
	return c.JSON(fiber.Map{
		"message": "Welcome " + username,
		"token":   token,
	})
}

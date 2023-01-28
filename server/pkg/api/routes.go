package api

import (
	"fmt"
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
	// api.App.Get("/metrics", monitor.New(monitor.Config{Title: "Scrabble Server Metrics"}))

	// api.App.Get("/ws", api.WebSocketManager.Accept())

	// api.App.Get("/", func(c *fiber.Ctx) error {
	// 	return c.SendString("Hello api")
	// })

	apiRoute := api.App.Group("/api")
	apiRoute.Post("/login", api.AccountCtrl.Login)

	// protected := apiRoute.Group("/").Use(basicauth.New(basicauth.Config{
	// 	Authorizer: api.Authorize,
	// }))
	// protected.Get("/user", func(c *fiber.Ctx) error {
	// 	return c.SendString("Hello user, you are allowed")
	// })

	apiRoute.Get("/accessible", accessible)
	r := apiRoute.Group("/restricted")
	r.Use(jwtware.New(jwtware.Config{
		SigningKey: []byte("secret"),
	}))
	r.Get("/", restricted)
}

func accessible(c *fiber.Ctx) error {
	return c.SendString("Accessible")
}

func restricted(c *fiber.Ctx) error {
	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	name := claims["name"].(string)
	return c.SendString("Welcome " + name)
}

func (api *API) Authorize(username, password string) bool {
	fmt.Println("username:", username)
	fmt.Println("password:", password)
	if err := api.AccountCtrl.Authorize(username, password); err != nil {
		return false
	}
	return true
}

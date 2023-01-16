package rest

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/monitor"
)

func HttpRouter() {
	app := fiber.New()
	middleware(app)
	gameRouter(app)
	app.Listen("127.0.0.1:3000")
}

func middleware(app *fiber.App) {
	app.Use(cors.New())
	app.Use(limiter.New(limiter.Config{Max: 500, Expiration: 30 * time.Second}))
	app.Use(logger.New(logger.Config{
		Format: "[${ip}]:${port} ${status} - ${method} ${path}\n",
	}))
	app.Get("/metrics", monitor.New(monitor.Config{Title: "MyService Metrics Page"}))
}

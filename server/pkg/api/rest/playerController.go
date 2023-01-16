package rest

import (
	"github.com/gofiber/fiber/v2"
)

func playerRouter(app *fiber.App) {
	api := app.Group("/api/db")
	api.Get("/avatar", func(c *fiber.Ctx) error {
		return c.SendString("vous avez televerser votre avatar")
	})
}

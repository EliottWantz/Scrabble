package rest

import (
	services "scrabble/pkg/api/services"

	"github.com/gofiber/fiber/v2"
)

func gameRouter(app *fiber.App) {
	api := app.Group("/api/game")
	api.Get("/start/", func(c *fiber.Ctx) error {
		services.StartGame()
		return c.SendString("game has started")
	})

	api.Get("/join", func(c *fiber.Ctx) error {
		return c.SendString("you have join the game")
	})
}

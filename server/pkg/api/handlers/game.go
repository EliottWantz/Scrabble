package handlers

import (
	"scrabble/pkg/api/services"

	"github.com/gofiber/fiber/v2"
)

func CreateGame(gs *services.GameService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		gs.StartGame()
		return c.SendString("game has started")
	}
}

func JoinGame() fiber.Handler {
	return func(c *fiber.Ctx) error {
		return c.SendString("you have join the game")
	}
}

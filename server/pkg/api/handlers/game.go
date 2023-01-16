package handlers

import (
	"scrabble/pkg/api/services"

	"github.com/gofiber/fiber/v2"
)

type GameHandler struct {
	Service *services.GameService
}

func (gh *GameHandler) CreateGame() fiber.Handler {
	return func(c *fiber.Ctx) error {
		gh.Service.StartGame()
		gh.Service.Repo.GetAllGames() // For exemple
		return c.SendString("game has started")
	}
}

func (gh *GameHandler) JoinGame() fiber.Handler {
	return func(c *fiber.Ctx) error {
		return c.SendString("you have join the game")
	}
}

package handlers

import (
	"scrabble/pkg/api/repository"
	"scrabble/pkg/api/services"

	"github.com/gofiber/fiber/v2"
)

type GameHandler struct {
	service *services.GameService
	repo    *repository.GameRepository
}

func (gh *GameHandler) CreateGame() fiber.Handler {
	return func(c *fiber.Ctx) error {
		gh.service.StartGame()
		gh.repo.GetAllGames() // For exemple
		return c.SendString("game has started")
	}
}

func (gh *GameHandler) JoinGame() fiber.Handler {
	return func(c *fiber.Ctx) error {
		return c.SendString("you have join the game")
	}
}

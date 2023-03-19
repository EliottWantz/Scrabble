package ws

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type GetMessagesResponse struct {
	NextSkip int           `json:"nextSkip,omitempty"`
	HasMore  bool          `json:"hasMore"`
	Messages []ChatMessage `json:"messages,omitempty"`
}

func (m *Manager) GetMessages(c *fiber.Ctx) error {
	roomID := c.Params("id")
	if roomID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Room ID is required")
	}
	skip, err := strconv.Atoi(c.Query("skip", "0"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid bucket skip value")
	}

	hasMore := true
	msgs, err := m.MessageRepo.LatestMessage(roomID, skip)
	if err != nil {
		skip--
		hasMore = false
		msgs, err = m.MessageRepo.LatestMessage(roomID, skip)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Failed to get messages: "+err.Error())
		}
	}

	skip++
	return c.Status(fiber.StatusOK).JSON(GetMessagesResponse{
		NextSkip: skip,
		HasMore:  hasMore,
		Messages: msgs,
	})
}

type ProtectedGameRequest struct {
	Password string `json:"password,omitempty"`
}

func (m *Manager) ProtectGame(c *fiber.Ctx) error {
	req := ProtectedGameRequest{}
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "decode req: "+err.Error())
	}

	gameID := c.Params("id")
	if gameID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Game ID is required")
	}

	_, err := m.GameSvc.ProtectGame(gameID, req.Password)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	m.UpdateJoinableGames()
	return c.SendStatus(fiber.StatusOK)
}

func (m *Manager) UnprotectGame(c *fiber.Ctx) error {
	gameID := c.Params("id")
	if gameID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Game ID is required")
	}

	m.GameSvc.UnprotectGame(gameID)
	m.UpdateJoinableGames()
	return c.SendStatus(fiber.StatusOK)
}

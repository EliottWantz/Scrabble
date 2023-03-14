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

type ProtectedRoomRequest struct {
	Password string `json:"password,omitempty"`
}

func (m *Manager) ProtectRoom(c *fiber.Ctx) error {
	roomID := c.Params("id")
	ProtectedRoom := ProtectedRoomRequest{}
	if err := c.BodyParser(&ProtectedRoom); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "decode req: "+err.Error())
	}

	if roomID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Room ID is required")
	}

	_, err := m.RoomSvc.ProtectGameRoom(roomID, ProtectedRoom.Password)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	m.UpdateJoinableGames()
	return c.SendStatus(fiber.StatusOK)
}

func (m *Manager) UnprotectRoom(c *fiber.Ctx) error {
	roomID := c.Params("id")
	if roomID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Room ID is required")
	}

	m.RoomSvc.UnprotectGameRoom(roomID)
	m.UpdateJoinableGames()
	return c.SendStatus(fiber.StatusOK)
}

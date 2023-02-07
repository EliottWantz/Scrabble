package ws

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type JoinRoomRequest struct {
	UserID string `json:"userId,omitempty"`
	RoomID string `json:"roomId,omitempty"`
}

func (m *Manager) JoinRoom(c *fiber.Ctx) error {
	req := JoinRoomRequest{}
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	if req.RoomID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Room ID is required")
	}
	if req.UserID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "User ID is required")
	}

	room, err := m.getRoom(req.RoomID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Room not found")
	}

	err = room.addClient(req.UserID)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to join room:"+err.Error())
	}

	return c.SendStatus(fiber.StatusOK)
}

func (m *Manager) GetMessages(c *fiber.Ctx) error {
	roomID := c.Query("roomId", m.GlobalRoom.ID)
	skip, err := strconv.Atoi(c.Query("skip", "0"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid skip value")
	}

	msgs, err := m.repo.GetLatestWithSkip(roomID, skip)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"messages": msgs,
	})
}

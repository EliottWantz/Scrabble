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
	msgs, err := m.repo.GetLatestWithSkip(roomID, skip)
	if err != nil {
		skip--
		hasMore = false
		msgs, err = m.repo.GetLatestWithSkip(roomID, skip)
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

type LogoutRequest struct {
	ID string `json:"id,omitempty"`
}

func (m *Manager) Logout(c *fiber.Ctx) error {
	req := LogoutRequest{}
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	return m.Disconnect(req.ID)
}

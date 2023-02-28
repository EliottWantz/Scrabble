package ws

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type JoinRoomRequest struct {
	UserID   string `json:"userId,omitempty"`
	RoomID   string `json:"roomId,omitempty"`
	RoomName string `json:"roomName,omitempty"`
}

func (m *Manager) JoinRoom(c *fiber.Ctx) error {
	req := JoinRoomRequest{}
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	if req.UserID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "User ID is required")
	}
	if req.RoomID == "" {
		if req.RoomName == "" {
			return fiber.NewError(fiber.StatusBadRequest, "Room ID is required")
		}
		// Create a new room with the given name and add the user to it
		r := m.CreateRoom(req.RoomName)
		if err := r.addClient(req.UserID); err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Failed to add client in new room"+err.Error())
		}
	} else {
		// Join an existing room
		r, err := m.GetRoom(req.RoomID)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "Room not found")
		}

		if err = r.addClient(req.UserID); err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Failed to join room: "+err.Error())
		}
	}

	return c.SendStatus(fiber.StatusOK)
}

type LeaveRoomRequest struct {
	UserID string `json:"userId,omitempty"`
	RoomID string `json:"roomId,omitempty"`
}

func (m *Manager) LeaveRoom(c *fiber.Ctx) error {
	req := LeaveRoomRequest{}
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	if req.RoomID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Room ID is required")
	}
	if req.UserID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "User ID is required")
	}

	if req.RoomID == req.UserID {
		return ErrLeavingOwnRoom
	}
	if req.RoomID == m.GlobalRoom.ID {
		return ErrLeavingGloabalRoom
	}

	r, err := m.GetRoom(req.RoomID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Room not found")
	}

	if err = r.removeClient(req.UserID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to leave room: "+err.Error())
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

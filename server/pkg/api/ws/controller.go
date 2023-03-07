package ws

import (
	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
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
		return fiber.NewError(fiber.StatusBadRequest, "user ID is required")
	}
	if req.RoomID == "" {
		if req.RoomName == "" {
			return fiber.NewError(fiber.StatusBadRequest, "room ID is required")
		}
		// Create a new room with the given name and add the user to it
		room, err := m.RoomSvc.CreateRoom(uuid.NewString(), req.RoomName, req.UserID)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to create new room"+err.Error())
		}
		err = m.UserSvc.Repo.AddJoinedRoom(room.ID, req.UserID)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to add user to room"+err.Error())
		}
		r := m.AddRoom(room.ID)
		if err := r.AddClient(req.UserID); err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to add client in new room"+err.Error())
		}
	} else {
		// Join an existing room
		r, err := m.GetRoom(req.RoomID)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "room not found: "+err.Error())
		}

		if err = m.RoomSvc.AddUser(req.RoomID, req.UserID); err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to join room: "+err.Error())
		}
		if err = r.AddClient(req.UserID); err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to join ws room: "+err.Error())
		}
		err = m.UserSvc.Repo.AddJoinedRoom(req.RoomID, req.UserID)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to add user to room"+err.Error())
		}
	}

	return c.SendStatus(fiber.StatusOK)
}

type JoinDMRequest struct {
	UserID     string `json:"userId,omitempty"`
	Username   string `json:"username,omitempty"`
	ToID       string `json:"toId,omitempty"`
	ToUsername string `json:"toUsername,omitempty"`
}
type JoinDMResponse struct {
	RoomID   string `json:"roomId,omitempty"`
	RoomName string `json:"roomName,omitempty"`
}

func (m *Manager) JoinDMRoom(c *fiber.Ctx) error {
	req := JoinDMRequest{}
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	// Create room with both users in it
	roomName := fmt.Sprintf("%s/%s", req.Username, req.ToUsername)
	dbRoom, err := m.RoomSvc.CreateRoom(
		uuid.NewString(),
		roomName,
		req.UserID,
		req.ToID,
	)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to create new room: "+err.Error())
	}

	// Add room to joinedRoom for both users
	err = m.UserSvc.Repo.AddJoinedRoom(dbRoom.ID, req.UserID)
	if err != nil {
		return fmt.Errorf("add user to room: %w", err)
	}
	err = m.UserSvc.Repo.AddJoinedRoom(dbRoom.ID, req.ToID)
	if err != nil {
		return fmt.Errorf("add user to room: %w", err)
	}

	r := m.AddRoom(dbRoom.ID)

	return c.Status(fiber.StatusCreated).JSON(JoinDMResponse{
		RoomID:   r.ID,
		RoomName: roomName,
	})
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
		return fiber.NewError(fiber.StatusBadRequest, "You cannot leave your own room")
	}
	if req.RoomID == m.GlobalRoom.ID {
		return fiber.NewError(fiber.StatusBadRequest, "You cannot leave the global room")
	}

	r, err := m.GetRoom(req.RoomID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "room not found: "+err.Error())
	}
	if err = m.RoomSvc.RemoveUser(req.RoomID, req.UserID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to leave room: "+err.Error())
	}
	if err = r.RemoveClient(req.UserID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to leave ws room: "+err.Error())
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

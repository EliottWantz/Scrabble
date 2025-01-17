package ws

import (
	"fmt"
	"strings"

	"scrabble/pkg/api/user"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/exp/slog"
)

func (m *Manager) sendFriendRequest(id string, friendId string) error {
	friend, err := m.UserSvc.GetUser(friendId)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "no user found")
	}
	if strings.Contains(strings.Join(friend.PendingRequests, ""), id) {
		return fiber.NewError(fiber.StatusBadRequest, "already sent a friend request")
	}

	if strings.Contains(strings.Join(friend.Friends, ""), id) {
		return fiber.NewError(fiber.StatusBadRequest, "already friends")
	}

	friend.PendingRequests = append(friend.PendingRequests, id)
	return m.UserSvc.Repo.Update(friend)
}

func (m *Manager) acceptFriendRequest(id string, friendId string) error {
	user, err := m.UserSvc.GetUser(id)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "no user found")
	}
	friend, err := m.UserSvc.GetUser(friendId)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "no user found")
	}

	if !strings.Contains(strings.Join(user.PendingRequests, ""), friendId) {
		return fiber.NewError(fiber.StatusBadRequest, "no friend request found")
	}

	if strings.Contains(strings.Join(user.Friends, ""), friendId) {
		return fiber.NewError(fiber.StatusBadRequest, "already friends")
	}
	for i, pending_id := range friend.PendingRequests {
		if pending_id == id {
			friend.PendingRequests = append(friend.PendingRequests[:i], friend.PendingRequests[i+1:]...)
		}
	}
	for i, pending_id := range user.PendingRequests {
		if pending_id == friendId {
			user.PendingRequests = append(user.PendingRequests[:i], user.PendingRequests[i+1:]...)
		}
	}
	user.Friends = append(user.Friends, friendId)
	friend.Friends = append(friend.Friends, id)
	if err := m.UserSvc.Repo.Update(friend); err != nil {
		return err
	}
	return m.UserSvc.Repo.Update(user)
}

func (m *Manager) rejectFriendRequest(id string, friendId string) error {
	friend, err := m.UserSvc.GetUser(friendId)
	if err != nil {
		return fmt.Errorf("get user: %w", err)
	}
	user, err := m.UserSvc.GetUser(id)
	if err != nil {
		return fmt.Errorf("get user: %w", err)
	}
	for i, pending_id := range user.PendingRequests {
		if pending_id == friendId {
			user.PendingRequests = append(user.PendingRequests[:i], user.PendingRequests[i+1:]...)
			if err := m.UserSvc.Repo.Update(user); err != nil {
				slog.Error("failed to update user", err)
			}
		}
	}

	for i, pending_id := range friend.PendingRequests {
		if pending_id == id {
			friend.PendingRequests = append(friend.PendingRequests[:i], friend.PendingRequests[i+1:]...)
			if err := m.UserSvc.Repo.Update(friend); err != nil {
				slog.Error("failed to update user", err)
			}
		}
	}
	for i, pending_id := range friend.Friends {
		if pending_id == id {
			friend.Friends = append(friend.Friends[:i], friend.Friends[i+1:]...)
			if err := m.UserSvc.Repo.Update(friend); err != nil {
				slog.Error("failed to update user", err)
			}
		}
	}

	return nil
}

func (m *Manager) GetFriendsList(id string) ([]*user.User, error) {
	usr, err := m.UserSvc.GetUser(id)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusBadRequest, "no user found")
	}
	friends := make([]*user.User, 0, len(usr.Friends))
	for _, id := range usr.Friends {
		f, err := m.UserSvc.GetUser(id)
		if err != nil {
			return nil, fiber.NewError(fiber.StatusBadRequest, "no user found")
		}
		friends = append(friends, f)
	}
	return friends, nil
}

func (m *Manager) GetFriendlistById(id string, friendId string) (*user.User, error) {
	user, err := m.UserSvc.GetUser(id)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusBadRequest, "no user found")
	}
	for _, id := range user.Friends {
		if id == friendId {
			f, err := m.UserSvc.GetUser(id)
			if err != nil {
				return nil, fiber.NewError(fiber.StatusBadRequest, "no user found")
			}
			return f, nil
		}
	}
	return nil, fiber.NewError(fiber.StatusBadRequest, "no friend found")
}

func (m *Manager) RemoveFriendFromList(id string, friendId string) error {
	user, err := m.UserSvc.GetUser(id)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "no user found")
	}
	for i, id := range user.Friends {
		if id == friendId {
			user.Friends = append(user.Friends[:i], user.Friends[i+1:]...)
			if err := m.UserSvc.Repo.Update(user); err != nil {
				slog.Error("failed to update user", err)
			}
		}
	}
	friend, err := m.UserSvc.GetUser(friendId)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "no user found")
	}
	for i, id := range friend.Friends {
		if friendId == id {
			friend.Friends = append(friend.Friends[:i], friend.Friends[i+1:]...)
			if err := m.UserSvc.Repo.Update(friend); err != nil {
				slog.Error("failed to update user", err)
			}
		}
	}
	return nil
}

func (m *Manager) GetPendingFriendlistRequests(id string) ([]*user.User, error) {
	usr, err := m.UserSvc.GetUser(id)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusBadRequest, "no user found")
	}
	friends := make([]*user.User, 0, len(usr.PendingRequests))
	for _, id := range usr.PendingRequests {
		f, err := m.UserSvc.GetUser(id)
		if err != nil {
			return nil, fiber.NewError(fiber.StatusBadRequest, "no user found")
		}
		friends = append(friends, f)
	}
	return friends, nil
}

type GetAddFriendListResponse struct {
	Users []user.User `json:"users"`
}

func (m *Manager) GetAddFriendList(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return fiber.NewError(fiber.StatusBadRequest, "no id provided")
	}
	usr, err := m.UserSvc.GetUser(id)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "no user found")
	}
	allUser := m.ListUsers()
	addList := make([]user.User, 0)
	for _, u := range allUser {
		if !contains(usr.Friends, u.ID) && !contains(usr.PendingRequests, u.ID) && !contains(u.PendingRequests, usr.ID) && u.ID != usr.ID {
			addList = append(addList, u)
		}
	}
	return c.JSON(GetAddFriendListResponse{Users: addList})
}

func contains(slice []string, val string) bool {
	for _, s := range slice {
		if s == val {
			return true
		}
	}
	return false
}

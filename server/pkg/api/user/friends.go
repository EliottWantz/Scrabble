package user

import (
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func (s *Service) sendFriendRequest(id string, friendId string) error {
	friend, err := s.GetUser(friendId)
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
	err = s.Repo.Update(friend)
	return nil
}

func (s *Service) acceptFriendRequest(id string, friendId string) error {
	user, err := s.GetUser(id)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "no user found")
	}
	if strings.Contains(strings.Join(user.Friends, ""), friendId) {
		return fiber.NewError(fiber.StatusBadRequest, "already friends")
	}
	for i, id := range user.PendingRequests {
		if id == friendId {
			user.PendingRequests = append(user.PendingRequests[:i], user.PendingRequests[i+1:]...)
		}
	}
	user.Friends = append(user.Friends, friendId)
	err = s.Repo.Update(user)
	return nil
}

func (s *Service) rejectFriendRequest(id string, friendId string) error {
	user, err := s.GetUser(id)
	if err != nil {
		return fmt.Errorf("get user: %w", err)
	}
	fmt.Println("ici1", user.PendingRequests)

	for i, id := range user.PendingRequests {
		if id == friendId {
			user.PendingRequests = append(user.PendingRequests[:i], user.PendingRequests[i+1:]...)
			err = s.Repo.Update(user)
			return nil
		}
	}
	return fiber.NewError(fiber.StatusBadRequest, "no friend request found")
}

func (s *Service) GetFriends(id string) ([]User, error) {
	user, err := s.GetUser(id)
	if err != nil {
		return nil, fmt.Errorf("get user: %w", err)
	}
	friends := make([]User, 0, len(user.Friends))
	for _, id := range user.Friends {
		f, err := s.GetUser(id)
		if err != nil {
			return nil, fmt.Errorf("get friend: %w", err)
		}
		friends = append(friends, *f)
	}
	return friends, nil
}

func (s *Service) GetPendingFriendRequests(id string) ([]User, error) {
	user, err := s.GetUser(id)
	if err != nil {
		return nil, fmt.Errorf("get user: %w", err)
	}
	requests := make([]User, 0, len(user.PendingRequests))
	for _, id := range user.PendingRequests {
		f, err := s.GetUser(id)
		if err != nil {
			return nil, fmt.Errorf("get friend: %w", err)
		}
		requests = append(requests, *f)
	}
	return requests, nil
}

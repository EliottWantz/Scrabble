package user

import "fmt"

func (s *Service) sendFriendRequest(req friendRequest) error {
	user, err := s.GetUser(req.ID)
	if err != nil {
		return fmt.Errorf("get user: %w", err)
	}
	user.PendingRequests = append(user.PendingRequests, req.FriendId)
	return nil
}

func (s *Service) acceptFriendRequest(req friendRequest) error {
	user, err := s.GetUser(req.ID)
	if err != nil {
		return fmt.Errorf("get user: %w", err)
	}
	user.Friends = append(user.Friends, req.FriendId)
	return nil
}

func (s *Service) rejectFriendRequest(req friendRequest) (bool, error) {
	user, err := s.GetUser(req.ID)
	if err != nil {
		return false, fmt.Errorf("get user: %w", err)
	}
	for i, id := range user.PendingRequests {
		if id == req.FriendId {
			user.PendingRequests = append(user.PendingRequests[:i], user.PendingRequests[i+1:]...)
			return true, nil
		}
	}
	return false, nil
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

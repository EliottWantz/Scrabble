package room

import (
	"fmt"
	"scrabble/pkg/api/auth"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) (*Service, error) {
	svc := &Service{repo: repo}
	if _, err := svc.Find("global"); err != nil {
		_, err := svc.CreateRoom("global", "Global Room", "system")
		if err != nil {
			return nil, err
		}
	}

	return svc, nil
}

func (s *Service) CreateRoom(ID, name, creatorID string, withUserIDs ...string) (*Room, error) {
	r := &Room{
		ID:        ID,
		Name:      name,
		CreatorID: creatorID,
		UserIDs:   []string{creatorID},
	}

	r.UserIDs = append(r.UserIDs, withUserIDs...)

	return r, s.repo.Insert(r)
}

func (s *Service) CreateGameRoom(ID, name, creatorID string, withUserIDs ...string) (*Room, error) {
	r := &Room{
		ID:         ID,
		Name:       name,
		CreatorID:  creatorID,
		UserIDs:    []string{creatorID},
		IsGameRoom: true,
	}

	r.UserIDs = append(r.UserIDs, withUserIDs...)

	return r, s.repo.Insert(r)
}
func (s *Service) ProtectGameRoom(Id, password string) (*Room, error) {
	hashPassword, err := auth.HashPassword(password)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	room, err := s.Find(Id)
	if err != nil {
		return nil, fmt.Errorf("room not found err: %w", err)
	}
	if !room.IsGameRoom {
		return nil, fmt.Errorf("room is not a game room")
	}
	room.IsProtected = true
	room.HashPassword = hashPassword
	s.repo.Update(room)
	return room, nil
}

func (s *Service) UnprotectGameRoom(Id string) error {
	room, err := s.Find(Id)
	if err != nil {
		return err
	}
	if !room.IsGameRoom {
		return fmt.Errorf("room is not a game room")
	}
	room.IsProtected = false
	room.HashPassword = ""
	s.repo.Update(room)
	return nil
}
func (s *Service) Find(ID string) (*Room, error) {
	return s.repo.Find(ID)
}

func (s *Service) GetAllChatRooms() ([]Room, error) {
	all, err := s.repo.FindAll()
	if err != nil {
		return nil, err
	}

	rooms := make([]Room, 0, len(all))
	for _, r := range all {
		if !r.IsGameRoom {
			rooms = append(rooms, r)
		}
	}

	return rooms, nil
}

func (s *Service) GetAllGameRooms() ([]Room, error) {
	all, err := s.repo.FindAll()
	if err != nil {
		return nil, err
	}

	rooms := make([]Room, 0, len(all))
	for _, r := range all {
		if r.IsGameRoom && len(r.UserIDs) < 4 {
			rooms = append(rooms, r)
		}
	}

	return rooms, nil
}

func (s *Service) AddUser(roomID, userID string) error {
	return s.repo.AddUser(roomID, userID)
}

func (s *Service) RemoveUser(roomID, userID string) error {
	err := s.repo.RemoveUser(roomID, userID)
	if err != nil {
		return fmt.Errorf("failed to remove user from room %s: %w", roomID, err)
	}

	return nil
}

func (s *Service) Delete(ID string) error {
	return s.repo.Delete(ID)
}

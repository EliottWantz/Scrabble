package room

import "fmt"

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) (*Service, error) {
	svc := &Service{repo: repo}
	if _, ok := svc.HasRoom("global"); !ok {
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

func (s *Service) HasRoom(ID string) (*Room, bool) {
	r, err := s.repo.Find(ID)
	return r, err == nil
}

func (s *Service) GetAllRooms() ([]Room, error) {
	return s.repo.FindAll()
}

func (s *Service) GetAllJoinableGameRooms() ([]Room, error) {
	rooms, err := s.repo.FindAll()
	if err != nil {
		return nil, err
	}

	joinableRooms := make([]Room, 0, len(rooms))
	for _, r := range rooms {
		if len(r.UserIDs) < 4 {
			joinableRooms = append(joinableRooms, r)
		}
	}

	return joinableRooms, nil
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

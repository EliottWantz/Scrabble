package room

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateRoom(ID, name string) (*Room, error) {
	r := &Room{
		ID:      ID,
		Name:    name,
		UserIDs: make([]string, 0),
	}

	return r, s.repo.Insert(r)
}

func (s *Service) HasRoom(ID string) (*Room, bool) {
	r, err := s.repo.Find(ID)
	return r, err == nil
}

func (s *Service) AddUserToRoom(roomID, userID string) error {
	return s.repo.AddUser(roomID, userID)
}

func (s *Service) RemoveUserFromRoom(roomID, userID string) error {
	return s.repo.RemoveUser(roomID, userID)
}

func (s *Service) Delete(ID string) error {
	return s.repo.Delete(ID)
}

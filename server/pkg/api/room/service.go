package room

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) (*Service, error) {
	svc := &Service{repo: repo}
	if _, ok := svc.HasRoom("global"); !ok {
		_, err := svc.CreateRoom("global", "Global")
		if err != nil {
			return nil, err
		}
	}

	return svc, nil
}

func (s *Service) CreateRoom(ID, name string, withUserIDs ...string) (*Room, error) {
	r := &Room{
		ID:      ID,
		Name:    name,
		UserIDs: make([]string, 0, 1),
	}

	r.UserIDs = append(r.UserIDs, withUserIDs...)

	return r, s.repo.Insert(r)
}

func (s *Service) HasRoom(ID string) (*Room, bool) {
	r, err := s.repo.Find(ID)
	return r, err == nil
}

func (s *Service) JoinRoom(roomID, userID string) error {
	return s.repo.AddUser(roomID, userID)
}

func (s *Service) LeaveRoom(roomID, userID string) error {
	return s.repo.RemoveUser(roomID, userID)
}

func (s *Service) Delete(ID string) error {
	return s.repo.Delete(ID)
}

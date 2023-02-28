package room

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) AddRoom(room *Room) error {
	return s.repo.Insert(room)
}

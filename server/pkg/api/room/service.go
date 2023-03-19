package room

type Service struct {
	Repo *Repository
}

func NewService(repo *Repository) (*Service, error) {
	svc := &Service{Repo: repo}
	if _, err := svc.Repo.Find("global"); err != nil {
		_, err := svc.CreateRoom("global", "Global Room", "system")
		if err != nil {
			return nil, err
		}
	}

	return svc, nil
}

func (s *Service) CreateRoom(ID, name string, withUserIDs ...string) (*Room, error) {
	r := &Room{
		ID:   ID,
		Name: name,
	}

	r.UserIDs = append(r.UserIDs, withUserIDs...)

	return r, s.Repo.Insert(r)
}

package user

func (s *Service) sendFriendRequest(req friendRequest) error {
	panic("not implemented")
}

func (s *Service) acceptFriendRequest(req friendRequest) error {
	panic("not implemented")
}

func (s *Service) rejectFriendRequest(req friendRequest) (bool, error) {
	panic("not implemented")
}

func (s *Service) GetFriends(id string) ([]User, error) {
	panic("not implemented")
}

func (s *Service) getFriendStatistcs(id string) (int, error) {
	panic("not implemented")
}

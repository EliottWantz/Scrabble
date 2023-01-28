package account

import "errors"

var ErrPasswordMismatch = errors.New("password mismatch")

type Service struct {
	repo *Repository
}

func (s *Service) Authorize(username, password string) error {
	a, err := s.repo.Find(username)
	if err != nil {
		return err
	}

	if a.Password != password {
		return ErrPasswordMismatch
	}

	return nil
}

package user

import (
	"errors"

	"scrabble/config"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

var (
	ErrUserAlreadyExists = errors.New("user already exists")
	ErrUserNotFound      = errors.New("user not found")
)

type Service struct {
	repo *Repository
}

func NewService(cfg *config.Config, repo *Repository) *Service {
	return &Service{
		repo: repo,
	}
}

func (s *Service) SignUp(req SignupRequest) (*User, error) {
	if req.Username == "" {
		return nil, fiber.NewError(fiber.StatusUnprocessableEntity, "username can't be blank")
	}

	if _, err := s.repo.FindByUsername(req.Username); err == nil {
		return nil, ErrUserAlreadyExists
	}

	u := &User{
		Id:       uuid.NewString(),
		Username: req.Username,
	}

	if err := s.repo.Insert(u); err != nil {
		return nil, err
	}

	return u, nil
}

func (s *Service) GetUser(ID string) (*User, error) {
	u, err := s.repo.Find(ID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	return u, nil
}

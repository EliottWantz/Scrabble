package user

import (
	"scrabble/config"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"golang.org/x/exp/slog"
)

type Service struct {
	repo *Repository
}

func NewService(cfg *config.Config, repo *Repository) *Service {
	return &Service{
		repo: repo,
	}
}

// Login up a new user, signup if doesn't exist
func (s *Service) Login(req LoginRequest) (*User, error) {
	if req.Username == "" {
		return nil, fiber.NewError(fiber.StatusUnprocessableEntity, "username can't be blank")
	}

	slog.Info("Login user", "username", req.Username)
	if s.repo.Has(req.Username) {
		return nil, fiber.NewError(fiber.StatusConflict, "user already exists")
	}

	u := &User{
		ID:       uuid.NewString(),
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

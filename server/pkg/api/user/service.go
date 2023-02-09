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
func (s *Service) Login(username string) (*User, error) {
	slog.Info("Login user", "username", username)
	if s.repo.Has(username) {
		return nil, fiber.NewError(fiber.StatusConflict, "user already exists")
	}

	u := &User{
		ID:       uuid.NewString(),
		Username: username,
	}

	if err := s.repo.Insert(u); err != nil {
		return nil, err
	}

	return u, nil
}

func (s *Service) Logout(req LogoutRequest) error {
	if !s.repo.Has(req.Username) {
		return fiber.NewError(fiber.StatusNotFound, "user not found")
	}

	if err := s.repo.Delete(req.Username); err != nil {
		return err
	}

	slog.Info("Logout user", "id", req.Username)

	return nil
}

func (s *Service) GetUser(ID string) (*User, error) {
	u, err := s.repo.Find(ID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	return u, nil
}

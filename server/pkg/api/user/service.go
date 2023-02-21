package user

import (
	"errors"

	"scrabble/config"
	"scrabble/pkg/api/auth"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/imagekit-developer/imagekit-go"
	"golang.org/x/exp/slog"
)

var (
	ErrPasswordMismatch  = errors.New("password mismatch")
	ErrUserAlreadyExists = errors.New("user already exists")
	ErrUserNotFound      = errors.New("user not found")
)

type Service struct {
	repo *Repository
	ik   *imagekit.ImageKit
}

func NewService(cfg *config.Config, repo *Repository) *Service {
	ik := imagekit.NewFromParams(imagekit.NewParams{
		PrivateKey:  cfg.IMAGEKIT_PRIVATE_KEY,
		PublicKey:   cfg.IMAGEKIT_PUBLIC_KEY,
		UrlEndpoint: cfg.IMAGEKIT_ENDPOINT_URL,
	})

	return &Service{
		repo: repo,
		ik:   ik,
	}
}

func (s *Service) SignUp(username, password, email string, authSvc *auth.Service) (*User, string, error) {
	if _, err := s.repo.FindByUsername(username); err == nil {
		return nil, "", ErrUserAlreadyExists
	}

	hashedPassword, err := auth.HashPassword(password)
	if err != nil {
		return nil, "", err
	}

	u := &User{
		Id:             uuid.NewString(),
		Username:       username,
		Email:          email,
		HashedPassword: hashedPassword,
	}

	if err := s.repo.Insert(u); err != nil {
		return nil, "", err
	}

	signed, err := authSvc.GenerateJWT(username)
	if err != nil {
		return nil, "", err
	}

	return u, signed, nil
}

func (s *Service) Login(username, password string, authSvc *auth.Service) (string, error) {
	u, err := s.repo.FindByUsername(username)
	if err != nil {
		return "", ErrUserNotFound
	}

	if !auth.PasswordsMatch(password, u.HashedPassword) {
		return "", ErrPasswordMismatch
	}

	signed, err := authSvc.GenerateJWT(username)
	if err != nil {
		return "", err
	}

	return signed, nil
}

func (s *Service) Logout(ID string) error {
	if !s.repo.Has(ID) {
		return fiber.NewError(fiber.StatusNotFound, "user not found")
	}

	if err := s.repo.Delete(ID); err != nil {
		return err
	}

	slog.Info("Logout user", "id", ID)

	return nil
}

func (s *Service) GetUser(ID string) (*User, error) {
	u, err := s.repo.Find(ID)
	if err != nil {
		return nil, err
	}

	return u, nil
}

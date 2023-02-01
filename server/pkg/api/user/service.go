package user

import (
	"errors"

	"scrabble/config"
	"scrabble/pkg/api/user/auth"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/imagekit-developer/imagekit-go"
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

func (s *Service) SignUp(req SignupRequest) (*User, string, error) {
	if req.Username == "" {
		return nil, "", fiber.NewError(fiber.StatusUnprocessableEntity, "username can't be blank")
	}
	if req.Password == "" {
		return nil, "", fiber.NewError(fiber.StatusUnprocessableEntity, "password can't be blank")
	}
	if req.Email == "" {
		return nil, "", fiber.NewError(fiber.StatusUnprocessableEntity, "email can't be blank")
	}

	if _, err := s.repo.Find(req.Username); err == nil {
		return nil, "", ErrUserAlreadyExists
	}

	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		return nil, "", err
	}

	u := &User{
		Id:             uuid.NewString(),
		Username:       req.Username,
		HashedPassword: hashedPassword,
	}

	if err := s.repo.Insert(u); err != nil {
		return nil, "", err
	}

	signed, err := auth.GenerateJWT(req.Username)
	if err != nil {
		return nil, "", err
	}

	return u, signed, nil
}

func (s *Service) Login(username, password string) (string, error) {
	u, err := s.repo.FindByUsername(username)
	if err != nil {
		return "", ErrUserNotFound
	}

	if !auth.PasswordsMatch(password, u.HashedPassword) {
		return "", ErrPasswordMismatch
	}

	signed, err := auth.GenerateJWT(username)
	if err != nil {
		return "", err
	}

	return signed, nil
}

func (s *Service) Revalidate(tokenStr string) (string, error) {
	return auth.RevalidateJWT(tokenStr)
}

func (s *Service) GetUser(ID string) (*User, error) {
	u, err := s.repo.Find(ID)
	if err != nil {
		return nil, err
	}

	return u, nil
}

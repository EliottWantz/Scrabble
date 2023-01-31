package user

import (
	"errors"

	"scrabble/pkg/api/user/auth"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

var (
	ErrPasswordMismatch  = errors.New("password mismatch")
	ErrUserAlreadyExists = errors.New("user already exists")
	ErrUserNotFound      = errors.New("user not found")
)

type Service struct {
	repo *Repository
}

func (s *Service) SignUp(username, password, email string) (string, error) {
	if username == "" {
		return "", fiber.NewError(fiber.StatusUnprocessableEntity, "username can't be blank")
	}
	if password == "" {
		return "", fiber.NewError(fiber.StatusUnprocessableEntity, "password can't be blank")
	}
	if email == "" {
		return "", fiber.NewError(fiber.StatusUnprocessableEntity, "email can't be blank")
	}

	if _, err := s.repo.Find(username); err == nil {
		return "", ErrUserAlreadyExists
	}

	hashedPassword, err := auth.HashPassword(password)
	if err != nil {
		return "", err
	}

	a := &User{
		Id:             uuid.NewString(),
		Username:       username,
		HashedPassword: hashedPassword,
	}

	if err := s.repo.Insert(a); err != nil {
		return "", err
	}

	signed, err := auth.GenerateJWT(username)
	if err != nil {
		return "", err
	}

	return signed, nil
}

func (s *Service) Login(username, password string) (string, error) {
	u, err := s.repo.Find(username)
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

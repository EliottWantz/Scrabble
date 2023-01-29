package user

import (
	"errors"
	"log"

	"scrabble/pkg/api/user/auth"

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

func (s *Service) SignUp(username, password string) (string, error) {
	if username == "" {
		return "", errors.New("empty username")
	}
	if password == "" {
		return "", errors.New("empty password")
	}

	if _, err := s.repo.Find(username); err == nil {
		return "", ErrUserAlreadyExists
	}

	a := &User{
		Id:       uuid.NewString(),
		Username: username,
		Password: password,
	}

	if err := s.repo.Insert(a); err != nil {
		return "", err
	}

	signed, err := auth.GenerateJWT(username)
	if err != nil {
		log.Println("error:", err)
		return "", err
	}

	return signed, nil
}

func (s *Service) Login(username, password string) (string, error) {
	u, err := s.repo.Find(username)
	if err != nil {
		return "", ErrUserNotFound
	}

	if u.Password != password {
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

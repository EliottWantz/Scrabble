package user

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
)

var (
	ErrPasswordMismatch  = errors.New("password mismatch")
	ErrUserAlreadyExists = errors.New("user already exists")
)

type Service struct {
	repo *Repository
}

func (s *Service) Login(username, password string) (*User, error) {
	if _, err := s.repo.Find(username); err == nil {
		return nil, ErrUserAlreadyExists
	}

	claims := jwt.MapClaims{
		"username": username,
		"exp":      time.Now().Add(time.Hour * 72).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signed, err := token.SignedString([]byte("secret"))
	if err != nil {
		return nil, err
	}

	a := &User{
		Id:       uuid.NewString(),
		Username: username,
		Password: password,
		Token:    signed,
	}

	// Create account in database
	if err := s.repo.Insert(a); err != nil {
		return nil, err
	}

	return a, nil
}

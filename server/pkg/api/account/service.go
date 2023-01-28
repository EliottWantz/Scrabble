package account

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

var ErrPasswordMismatch = errors.New("password mismatch")

type Service struct {
	repo *Repository
}

func (s *Service) Login(username, password string) (string, error) {
	// Set custom claims
	// Create the Claims
	claims := jwt.MapClaims{
		"name":  "John Doe",
		"admin": true,
		"exp":   time.Now().Add(time.Hour * 72).Unix(),
	}

	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Generate encoded token and send it as response.
	return token.SignedString([]byte("secret"))
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

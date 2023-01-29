package user

import (
	"errors"
	"log"
	"time"

	"github.com/golang-jwt/jwt/v4"
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

	claims := JWTClaims{
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Second * 10)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signed, err := token.SignedString([]byte("secret"))
	if err != nil {
		log.Println("error:", err)
		return "", err
	}

	a := &User{
		Id:       uuid.NewString(),
		Username: username,
		Password: password,
	}

	if err := s.repo.Insert(a); err != nil {
		return "", err
	}

	return signed, nil
}

type JWTClaims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func (s *Service) Login(username, password string) (string, error) {
	u, err := s.repo.Find(username)
	if err != nil {
		return "", ErrUserNotFound
	}

	if u.Password != password {
		return "", ErrPasswordMismatch
	}

	claims := JWTClaims{
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Second * 10)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signed, err := token.SignedString([]byte("secret"))
	if err != nil {
		return "", err
	}

	return signed, nil
}

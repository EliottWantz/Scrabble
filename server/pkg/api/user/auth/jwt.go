package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v4"
)

type JWTClaims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func NewClaims(username string) *JWTClaims {
	return &JWTClaims{
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Second * 10)),
		},
	}
}

func GenerateJWT(username string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, NewClaims(username))
	return token.SignedString([]byte("secret"))
}

func RevalidateJWT(tokenStr string) (string, error) {
	claims := &JWTClaims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte("secret"), nil
	})
	if err != nil {
		return "", err
	}

	if !token.Valid {
		return "", err
	}

	claims.ExpiresAt = jwt.NewNumericDate(time.Now().Add(time.Second * 10))
	signed, err := token.SignedString([]byte("secret"))
	if err != nil {
		return "", err
	}

	return signed, nil
}
package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v4"
)

type Service struct {
	secret        []byte
	signingMethod jwt.SigningMethod
}

func NewService(secret string) *Service {
	return &Service{
		secret:        []byte(secret),
		signingMethod: jwt.SigningMethodHS256,
	}
}

type JWTClaims struct {
	UserID string `json:"userId"`
	jwt.RegisteredClaims
}

func NewClaims(userID string) *JWTClaims {
	return &JWTClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			// ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Second * 20)),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24 * 30)),
		},
	}
}

func (s *Service) GenerateJWT(userID string) (string, error) {
	token := jwt.NewWithClaims(s.signingMethod, NewClaims(userID))
	return token.SignedString(s.secret)
}

func (s *Service) VerifyJWT(tokenStr string) (*JWTClaims, error) {
	claims := &JWTClaims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return s.secret, nil
	})
	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, err
	}

	return claims, nil
}

func (s *Service) RefreshJWT(tokenStr string, claims *JWTClaims) (string, error) {
	// claims.ExpiresAt = jwt.NewNumericDate(time.Now().Add(time.Second * 20))
	claims.ExpiresAt = jwt.NewNumericDate(time.Now().Add(time.Hour * 24 * 30))
	token := jwt.NewWithClaims(s.signingMethod, claims)
	return token.SignedString(s.secret)
}

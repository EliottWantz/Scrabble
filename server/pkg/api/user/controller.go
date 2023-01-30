package user

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/exp/slog"
)

type Controller struct {
	svc *Service
}

func NewController(db *mongo.Database) *Controller {
	return &Controller{
		svc: &Service{
			repo: &Repository{
				coll: db.Collection("users"),
			},
		},
	}
}

type SignupRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type SignupResponse struct {
	Token string `json:"token"`
}

// Sign up a new user
func (ctrl *Controller) SignUp(c *fiber.Ctx) error {
	req := SignupRequest{}
	if err := c.BodyParser(&req); err != nil {
		return fiber.ErrBadRequest
	}

	token, err := ctrl.svc.SignUp(req.Username, req.Password)
	if err != nil {
		slog.Error("Error signing up user", err)
		if errors.Is(err, ErrUserAlreadyExists) {
			return fiber.ErrConflict
		}
		return fiber.ErrInternalServerError
	}

	return c.Status(fiber.StatusCreated).JSON(SignupResponse{Token: token})
}

type LoginRequest struct {
	Username string `json:"username,omitempty"`
	Password string `json:"password,omitempty"`
}

type LoginResponse struct {
	Token string `json:"token,omitempty"`
	Error string `json:"error,omitempty"`
}

func (ctrl *Controller) Login(c *fiber.Ctx) error {
	var req LoginRequest
	err := c.BodyParser(&req)
	if err != nil {
		return fiber.ErrInternalServerError
	}

	token, err := ctrl.svc.Login(req.Username, req.Password)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			return c.Status(fiber.StatusConflict).JSON(
				LoginResponse{Error: "user not found with given username"},
			)
		}
		if errors.Is(err, ErrPasswordMismatch) {
			return fiber.ErrUnauthorized
		}
		return fiber.ErrInternalServerError
	}

	return c.JSON(LoginResponse{
		Token: token,
	})
}

type RevalidateRequest struct {
	Token string `json:"token,omitempty"`
}
type RevalidateResponse struct {
	Token string `json:"token,omitempty"`
	Error string `json:"error,omitempty"`
}

// Revalidate jwt token
func (ctrl *Controller) Revalidate(c *fiber.Ctx) error {
	var req RevalidateRequest
	err := c.BodyParser(&req)
	if err != nil {
		return fiber.ErrInternalServerError
	}

	token, err := ctrl.svc.Revalidate(req.Token)
	if err != nil {
		slog.Error("Error revalidating token", err)
		if errors.Is(err, jwt.ErrSignatureInvalid) {
			return fiber.ErrUnauthorized
		}
		if errors.Is(err, fiber.ErrUnauthorized) {
			return fiber.ErrUnauthorized
		}
		if errors.Is(err, jwt.ErrTokenExpired) || errors.Is(err, jwt.ErrSignatureInvalid) {
			return fiber.ErrUnauthorized
		}
		return fiber.ErrInternalServerError
	}

	return c.JSON(RevalidateResponse{
		Token: token,
	})
}

func (ctrl *Controller) UploadAvatar() fiber.Handler {
	return func(c *fiber.Ctx) error {
		return c.SendString("vous avez televerser votre avatar")
	}
}

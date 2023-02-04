package user

import (
	"errors"

	"scrabble/config"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/exp/slog"
)

type Controller struct {
	svc *Service
}

func NewController(cfg *config.Config, db *mongo.Database) *Controller {
	return &Controller{
		svc: NewService(cfg, NewRepository(db)),
	}
}

type SignupRequest struct {
	Username  string `json:"username,omitempty"`
	Password  string `json:"password,omitempty"`
	Email     string `json:"email,omitempty"`
	AvatarURL string `json:"avatarUrl,omitempty"`
}

type SignupResponse struct {
	User  *User  `json:"user,omitempty"`
	Token string `json:"token,omitempty"`
}

// Sign up a new user
func (ctrl *Controller) SignUp(c *fiber.Ctx) error {
	req := SignupRequest{}
	if err := c.BodyParser(&req); err != nil {
		return fiber.ErrBadRequest
	}

	user, token, err := ctrl.svc.SignUp(req)
	if err != nil {
		slog.Error("sign up user", err)
		if errors.Is(err, ErrUserAlreadyExists) {
			return fiber.ErrConflict
		}
		var fiberErr *fiber.Error
		if ok := errors.As(err, &fiberErr); ok {
			return err
		}
		return fiber.ErrInternalServerError
	}

	return c.Status(fiber.StatusCreated).JSON(
		SignupResponse{
			User:  user,
			Token: token,
		},
	)
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

type GetUserResponse struct {
	User  *User  `json:"user,omitempty"`
	Error string `json:"error,omitempty"`
}

func (ctrl *Controller) GetUser(c *fiber.Ctx) error {
	ID := c.Params("id")
	if ID == "" {
		return fiber.ErrBadRequest
	}

	user, err := ctrl.svc.GetUser(ID)
	if err != nil {
		slog.Error("Error getting user", err)
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.JSON(GetUserResponse{
		User: user,
	})
}

type UploadAvatarRequest struct {
	ID        string `json:"id,omitempty"`
	AvatarUrl string `json:"avatarUrl,omitempty"`
}

type UploadAvatarResponse struct {
	AvatarURL string `json:"avatarUrl,omitempty"`
	Error     string `json:"error,omitempty"`
}

func (ctrl *Controller) UploadAvatar(c *fiber.Ctx) error {
	var req UploadAvatarRequest
	err := c.BodyParser(&req)
	if err != nil {
		return fiber.ErrInternalServerError
	}

	url, err := ctrl.svc.UploadAvatar(req.ID, req.AvatarUrl)
	if err != nil {
		var fiberErr *fiber.Error
		if ok := errors.As(err, &fiberErr); ok {
			return c.Status(fiberErr.Code).JSON(
				UploadAvatarResponse{
					Error: fiberErr.Message,
				},
			)
		}
		return c.Status(fiber.StatusInternalServerError).JSON(
			UploadAvatarResponse{
				Error: err.Error(),
			},
		)
	}

	return c.Status(fiber.StatusCreated).JSON(
		UploadAvatarResponse{
			AvatarURL: url,
		},
	)
}

// type GetAvatarRequest struct {
// 	Username string `json:"username,omitempty"`
// }

// type GetAvatarResponse struct {
// 	AvatarURL string `json:"avatarUrl,omitempty"`
// 	Error     string `json:"error,omitempty"`
// }

// func (ctrl *Controller) GetAvatar(c *fiber.Ctx) error {
// 	var req GetAvatarRequest
// 	err := c.BodyParser(&req)
// 	if err != nil {
// 		return fiber.ErrInternalServerError
// 	}

// 	url, err := ctrl.svc.GetAvatar(req.Username)
// 	if err != nil {
// 		var fiberErr *fiber.Error
// 		if ok := errors.As(err, &fiberErr); ok {
// 			return c.Status(fiberErr.Code).JSON(
// 				GetAvatarResponse{
// 					Error: fiberErr.Message,
// 				},
// 			)
// 		}
// 		return c.Status(fiber.StatusInternalServerError).JSON(
// 			GetAvatarResponse{
// 				Error: err.Error(),
// 			},
// 		)
// 	}

// 	return c.JSON(GetAvatarResponse{
// 		AvatarURL: url,
// 	})
// }

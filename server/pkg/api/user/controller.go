package user

import (
	"errors"

	"scrabble/config"
	"scrabble/pkg/api/ws"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/exp/slog"
)

type Controller struct {
	svc *Service
}

func NewController(cfg *config.Config) *Controller {
	return &Controller{
		svc: NewService(cfg, NewRepository()),
	}
}

type LoginRequest struct {
	Username string `json:"username,omitempty"`
}

type LoginResponse struct {
	User  *User  `json:"user,omitempty"`
	Error string `json:"error,omitempty"`
}

// Login up a new user, signup if doesn't exist
func (ctrl *Controller) Login(c *fiber.Ctx) error {
	req := LoginRequest{}
	if err := c.BodyParser(&req); err != nil {
		return fiber.ErrBadRequest
	}

	user, err := ctrl.svc.Login(req)
	if err != nil {
		slog.Error("login user", err)
		var fiberErr *fiber.Error
		if ok := errors.As(err, &fiberErr); ok {
			return c.Status(fiberErr.Code).JSON(LoginResponse{
				Error: err.Error(),
			})
		}
		return fiber.ErrInternalServerError
	}

	return c.Status(fiber.StatusCreated).JSON(
		LoginResponse{
			User: user,
		},
	)
}

type LogoutRequest struct {
	ID string `json:"id,omitempty"`
}
type LogoutResponse struct {
	Error string `json:"error,omitempty"`
}

func (ctrl *Controller) Logout(ws *ws.Manager) fiber.Handler {
	return func(c *fiber.Ctx) error {
		req := LogoutRequest{}
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(LogoutResponse{
				Error: err.Error(),
			})
		}

		if err := ws.RemoveClient(req.ID); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(LogoutResponse{
				Error: err.Error(),
			})
		}

		return c.SendStatus(fiber.StatusOK)
	}
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

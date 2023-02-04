package user

import (
	"errors"

	"scrabble/config"

	"github.com/gofiber/fiber/v2"
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
	Username string `json:"username,omitempty"`
}

type SignupResponse struct {
	User *User `json:"user,omitempty"`
}

// Sign up a new user
func (ctrl *Controller) SignUp(c *fiber.Ctx) error {
	req := SignupRequest{}
	if err := c.BodyParser(&req); err != nil {
		return fiber.ErrBadRequest
	}

	user, err := ctrl.svc.SignUp(req)
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
			User: user,
		},
	)
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

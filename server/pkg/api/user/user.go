package user

import (
	"errors"

	"scrabble/config"
	"scrabble/pkg/api/auth"
	"scrabble/pkg/api/ws"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/exp/slog"
)

type User struct {
	Id             string `bson:"_id,omitempty" json:"id,omitempty"`
	Username       string `bson:"username" json:"username,omitempty"`
	HashedPassword string `bson:"password" json:"-"`
	Email          string `bson:"email" json:"email,omitempty"`
	AvatarURL      string `bson:"avatarUrl" json:"avatarUrl,omitempty"`
	Preferences    Preferences
}

type Controller struct {
	svc     *Service
	authSvc *auth.Service
}

func NewController(cfg *config.Config, db *mongo.Database) *Controller {
	return &Controller{
		svc:     NewService(cfg, NewRepository(db)),
		authSvc: auth.NewService(cfg.JWT_SIGN_KEY),
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

	if req.Username == "" {
		return fiber.NewError(fiber.StatusUnprocessableEntity, "username can't be blank")
	}
	if req.Password == "" {
		return fiber.NewError(fiber.StatusUnprocessableEntity, "password can't be blank")
	}
	if req.Email == "" {
		return fiber.NewError(fiber.StatusUnprocessableEntity, "email can't be blank")
	}

	user, token, err := ctrl.svc.SignUp(req.Username, req.Password, req.Email, ctrl.authSvc)
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

	token, err := ctrl.svc.Login(req.Username, req.Password, ctrl.authSvc)
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

type LogoutRequest struct {
	ID       string `json:"id,omitempty"`
	Username string `json:"username,omitempty"`
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

		if err := ctrl.svc.Logout(req.ID); err != nil {
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

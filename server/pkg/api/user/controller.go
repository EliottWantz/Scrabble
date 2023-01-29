package user

import (
	"errors"
	"log"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/mongo"
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
		log.Println(err)
		if errors.Is(err, ErrUserAlreadyExists) {
			return fiber.ErrConflict
		}
		return fiber.ErrInternalServerError
	}

	return c.Status(fiber.StatusCreated).JSON(SignupResponse{Token: token})
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
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
			return fiber.ErrConflict
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

func (ctrl *Controller) UploadAvatar() fiber.Handler {
	return func(c *fiber.Ctx) error {
		return c.SendString("vous avez televerser votre avatar")
	}
}

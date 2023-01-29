package user

import (
	"errors"

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

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (ctrl *Controller) Login(c *fiber.Ctx) error {
	var req LoginRequest
	err := c.BodyParser(&req)
	if err != nil {
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	token, err := ctrl.svc.Login(req.Username, req.Password)
	if err != nil {
		if errors.Is(err, ErrUserAlreadyExists) {
			return c.SendStatus(fiber.StatusConflict)
		}
		return c.SendStatus(fiber.StatusInternalServerError)
	}

	return c.JSON(fiber.Map{
		"token": token,
	})
}

func (ctrl *Controller) UploadAvatar() fiber.Handler {
	return func(c *fiber.Ctx) error {
		return c.SendString("vous avez televerser votre avatar")
	}
}

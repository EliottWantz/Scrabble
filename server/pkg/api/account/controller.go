package account

import (
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
				coll: db.Collection("accounts"),
			},
		},
	}
}

func (c *Controller) Authorize(username, password string) error {
	return c.svc.Authorize(username, password)
}

func (ctrl *Controller) UploadAvatar() fiber.Handler {
	return func(c *fiber.Ctx) error {
		return c.SendString("vous avez televerser votre avatar")
	}
}

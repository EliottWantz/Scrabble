package account

import (
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/mongo"
)

type Controller struct {
	svc *Service
}

func NewController(coll *mongo.Collection) *Controller {
	return &Controller{svc: &Service{repo: &Repository{coll: coll}}}
}

func (ctrl *Controller) UploadAvatar() fiber.Handler {
	return func(c *fiber.Ctx) error {
		return c.SendString("vous avez televerser votre avatar")
	}
}

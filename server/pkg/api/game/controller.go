package game

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

func (ctrl *Controller) CreateGame() fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctrl.svc.StartGame()
		return c.SendString("game has started")
	}
}

func (ctrl *Controller) JoinGame() fiber.Handler {
	return func(c *fiber.Ctx) error {
		return c.SendString("you have join the game")
	}
}

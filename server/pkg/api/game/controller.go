package game

import (
	"scrabble/pkg/api/room"

	"github.com/gofiber/fiber/v2"
)

type Controller struct {
	svc     *Service
	RoomSvc *room.Service
}

func NewController(svc *Service, roomSvc *room.Service) *Controller {
	return &Controller{
		svc:     svc,
		RoomSvc: roomSvc,
	}
}

type StartGameRequest struct {
	RoomID string `json:"roomId"`
}
type StartGameResponse struct {
	Game *Game `json:"game"`
}

func (ctrl *Controller) StartGame(c *fiber.Ctx) error {
	req := StartGameRequest{}
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusUnprocessableEntity, "parse request: "+err.Error())
	}
	r, ok := ctrl.RoomSvc.HasRoom(req.RoomID)
	if !ok {
		return fiber.NewError(fiber.StatusNotFound, "Room not found")
	}
	g, err := ctrl.svc.StartGame(r)
	if err != nil {
		return err
	}
	return c.Status(fiber.StatusCreated).JSON(StartGameResponse{Game: g})
}

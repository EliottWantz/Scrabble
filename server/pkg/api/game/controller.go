package game

import (
	"scrabble/pkg/api/room"
	"scrabble/pkg/scrabble"

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

type PlayMoveRequest struct {
	PlayerID string                    `json:"playerId"`
	Type     string                    `json:"type,omitempty"`
	Letters  string                    `json:"letters,omitempty"`
	Covers   map[string]scrabble.Cover `json:"covers"`
}

func (ctrl *Controller) PlayMove(c *fiber.Ctx) error {
	req := PlayMoveRequest{}
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusUnprocessableEntity, "parse request: "+err.Error())
	}
	gID := c.Params("id")
	err := ctrl.svc.ApplyPlayerMove(gID, req)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.SendString("move applied")
}

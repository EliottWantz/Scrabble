package api

import (
	"time"

	"scrabble/config"
	"scrabble/pkg/api/user"
	"scrabble/pkg/api/ws"

	"github.com/gofiber/fiber/v2"
)

type API struct {
	WebSocketManager *ws.Manager
	App              *fiber.App
	UserCtrl         *user.Controller
}

func New(cfg *config.Config) (*API, error) {
	api := &API{
		App:      fiber.New(),
		UserCtrl: user.NewController(cfg),
	}

	ws, err := ws.NewManager()
	if err != nil {
		return nil, err
	}

	api.WebSocketManager = ws

	api.setupMiddleware()
	api.setupRoutes(cfg)

	return api, nil
}

func (api *API) Shutdown() error {
	err := api.App.ShutdownWithTimeout(time.Second * 10)
	if err != nil {
		return err
	}

	return nil
}

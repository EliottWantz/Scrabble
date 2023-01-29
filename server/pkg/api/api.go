package api

import (
	"time"

	"scrabble/config"
	"scrabble/pkg/api/game"
	"scrabble/pkg/api/storage"
	"scrabble/pkg/api/user"
	"scrabble/pkg/api/ws"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/mongo"
)

var CONNECTION_TIMEOUT = 10 * time.Second

type API struct {
	WebSocketManager *ws.Manager
	App              *fiber.App
	GameCtrl         *game.Controller
	UserCtrl         *user.Controller
	DB               *mongo.Database
}

func New(cfg config.Config) (*API, error) {
	db, err := storage.OpenDB(cfg.MONGODB_URI, cfg.MONGODB_NAME, CONNECTION_TIMEOUT)
	if err != nil {
		return nil, err
	}

	api := &API{
		WebSocketManager: ws.NewManager(),
		App:              fiber.New(),
		GameCtrl:         game.NewController(db),
		UserCtrl:         user.NewController(db),
		DB:               db,
	}

	api.setupMiddleware()
	api.setupRoutes()

	return api, nil
}

func (api *API) Shutdown() error {
	err := storage.CloseDB(api.DB)
	if err != nil {
		return err
	}

	err = api.App.ShutdownWithTimeout(time.Second * 10)
	if err != nil {
		return err
	}

	return nil
}

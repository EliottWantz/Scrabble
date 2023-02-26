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
	"golang.org/x/exp/slog"
)

var CONNECTION_TIMEOUT = time.Second * 15

type API struct {
	WebSocketManager *ws.Manager
	App              *fiber.App
	GameCtrl         *game.Controller
	UserCtrl         *user.Controller
	DB               *mongo.Database
}

func New(cfg *config.Config) (*API, error) {
	slog.Info("Opening database...")
	db, err := storage.OpenDB(cfg.MONGODB_URI, cfg.MONGODB_NAME, CONNECTION_TIMEOUT)
	if err != nil {
		return nil, err
	}
	slog.Info("Database opened.")

	api := &API{
		App:      fiber.New(),
		GameCtrl: game.NewController(db),
		DB:       db,
	}

	userCtrl, err := user.NewController(cfg, db)
	if err != nil {
		return nil, err
	}
	api.UserCtrl = userCtrl

	ws, err := ws.NewManager(db)
	if err != nil {
		return nil, err
	}

	api.WebSocketManager = ws

	api.setupRoutes(cfg)

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

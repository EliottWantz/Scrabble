package api

import (
	"errors"
	"time"

	"scrabble/config"
	"scrabble/pkg/api/auth"
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
	App    *fiber.App
	logger *slog.Logger
	Ctrls  Controllers
	Svcs   Services
	Repos  Repositories
	DB     *mongo.Database
}

type Controllers struct {
	GameCtrl         *game.Controller
	UserCtrl         *user.Controller
	WebSocketManager *ws.Manager
}

type Services struct {
	GameSvc *game.Service
	UserSvc *user.Service
	AuthSvc *auth.Service
}

type Repositories struct {
	GameRepo    *game.Repository
	UserRepo    *user.Repository
	MessageRepo *ws.MessageRepository
	RoomRepo    *ws.RoomRepository
}

func New(cfg *config.Config) (*API, error) {
	slog.Info("Opening database...")
	db, err := storage.OpenDB(cfg.MONGODB_URI, cfg.MONGODB_NAME, CONNECTION_TIMEOUT)
	if err != nil {
		return nil, err
	}
	slog.Info("Database opened.")

	var repositories Repositories
	{
		gameRepo := game.NewRepository(db)
		userRepo := user.NewRepository(db)
		messageRepo := ws.NewMessageRepository(db)
		roomRepo := ws.NewRoomRepository(db)

		repositories = Repositories{
			GameRepo:    gameRepo,
			UserRepo:    userRepo,
			MessageRepo: messageRepo,
			RoomRepo:    roomRepo,
		}
	}

	var services Services
	{
		userSvc, err := user.NewService(cfg, repositories.UserRepo)
		if err != nil {
			return nil, err
		}
		gameSvc := game.NewService(repositories.GameRepo)
		authSvc := auth.NewService(cfg.JWT_SIGN_KEY)

		services = Services{
			GameSvc: gameSvc,
			UserSvc: userSvc,
			AuthSvc: authSvc,
		}
	}

	var controllers Controllers
	{
		wsManager, err := ws.NewManager(repositories.MessageRepo, repositories.RoomRepo, repositories.UserRepo)
		if err != nil {
			return nil, err
		}
		gameCtrl := game.NewController(services.GameSvc)
		userCtrl := user.NewController(services.UserSvc, services.AuthSvc)

		controllers = Controllers{
			GameCtrl:         gameCtrl,
			UserCtrl:         userCtrl,
			WebSocketManager: wsManager,
		}
	}

	api := &API{
		App: fiber.New(fiber.Config{
			ErrorHandler: func(c *fiber.Ctx, err error) error {
				code := fiber.StatusInternalServerError
				var e *fiber.Error
				if errors.As(err, &e) {
					code = e.Code
				}
				return c.Status(code).JSON(err)
			},
		}),
		logger: slog.Default(),
		Ctrls:  controllers,
		Svcs:   services,
		Repos:  repositories,
		DB:     db,
	}

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

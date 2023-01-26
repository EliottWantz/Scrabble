package api

import (
	"time"

	"scrabble/config"
	"scrabble/pkg/api/account"
	"scrabble/pkg/api/game"
	"scrabble/pkg/api/storage"
	"scrabble/pkg/api/ws"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/mongo"
)

var CONNECTION_TIMEOUT = 10 * time.Second

type Server struct {
	WebSocketManager *ws.Manager
	App              *fiber.App
	GameCtrl         *game.Controller
	AccountCtrl      *account.Controller
	DB               *mongo.Database
}

func NewServer(cfg config.Config) (*Server, error) {
	db, err := storage.OpenDB(cfg.MONGODB_URI, cfg.MONGODB_NAME, CONNECTION_TIMEOUT)
	if err != nil {
		return nil, err
	}

	s := &Server{
		WebSocketManager: ws.NewManager(),
		App:              fiber.New(),
		GameCtrl:         game.NewController(db.Collection("games")),
		AccountCtrl:      account.NewController(db.Collection("users")),
		DB:               db,
	}

	s.setupMiddleware()
	s.setupRoutes()

	return s, nil
}

func (s *Server) GracefulShutdown() {
	_ = storage.CloseDB(s.DB)
	_ = s.App.Shutdown()
}

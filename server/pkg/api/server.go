package api

import (
	"flag"
	"time"

	"scrabble/pkg/api/handlers"
	"scrabble/pkg/api/ws"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/monitor"
	"go.mongodb.org/mongo-driver/mongo"
)

var prefork = flag.Bool("Prefork", false, "Fiber prefork (multiple threads)")

type Server struct {
	WebSocketManager *ws.Manager
	App              *fiber.App
	GameHandler      *handlers.GameHandler
	AccountHandler   *handlers.AccountHandler
	DB               *mongo.Database
}

func NewServer() *Server {
	config := fiber.Config{
		Prefork: *prefork,
	}

	s := &Server{
		WebSocketManager: ws.NewManager(),
		App:              fiber.New(config),
		GameHandler:      &handlers.GameHandler{},
		AccountHandler:   &handlers.AccountHandler{},
	}

	s.setupMiddleware()
	s.setupRoutes()

	return s
}

func (s *Server) setupMiddleware() {
	s.App.Use(cors.New())
	s.App.Use(limiter.New(limiter.Config{Max: 500, Expiration: 30 * time.Second}))
	s.App.Use(logger.New(logger.Config{
		Format: "[${ip}]:${port} ${status} - ${method} ${path}\n",
	}))
	s.App.Get("/metrics", monitor.New(monitor.Config{Title: "Scrabble Server Metrics"}))
}

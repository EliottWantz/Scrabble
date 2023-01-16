package api

import (
	"time"

	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/monitor"
)

func (s *Server) setupMiddleware() {
	s.App.Use(cors.New())
	s.App.Use(limiter.New(limiter.Config{Max: 500, Expiration: 30 * time.Second}))
	s.App.Use(logger.New(logger.Config{
		Format: "[${ip}]:${port} ${status} - ${method} ${path}\n",
	}))
	s.App.Get("/metrics", monitor.New(monitor.Config{Title: "MyService Metrics Page"}))
}

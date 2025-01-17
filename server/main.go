package main

import (
	"os"
	"os/signal"

	"scrabble/config"
	"scrabble/pkg/api"

	"golang.org/x/exp/slog"
)

func main() {
	// Default log handler
	slog.SetDefault(slog.Default())

	err := run()
	if err != nil {
		slog.Error("main error", err)
		os.Exit(1)
	}
}

func run() error {
	// load config
	cfg, err := config.LoadConfig()
	if err != nil {
		return err
	}

	server, err := api.New(cfg)
	if err != nil {
		return err
	}

	errChan := make(chan error, 1)
	go func() {
		err = server.App.Listen("0.0.0.0:" + cfg.PORT)
		if err != nil {
			errChan <- err
		}
	}()

	go func() {
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, os.Interrupt)
		sig := <-quit
		slog.Info("shutting down", "signal", sig)
		errChan <- server.App.Shutdown()
	}()

	return <-errChan
}

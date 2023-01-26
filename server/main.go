package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"scrabble/config"
	"scrabble/pkg/api"
)

func main() {
	err := run()
	if err != nil {
		fmt.Printf("error: %v\n", err)
		os.Exit(1)
	}
}

func run() error {
	// load config
	cfg, err := config.LoadConfig()
	if err != nil {
		return err
	}

	server, err := api.NewServer(cfg)
	if err != nil {
		return err
	}

	go GracefulShutdown(server.GracefulShutdown)

	err = server.App.Listen("0.0.0.0:" + cfg.PORT)
	if err != nil {
		return err
	}

	return nil
}

func GracefulShutdown(cleanup func()) {
	quit := make(chan os.Signal, 1)
	defer close(quit)

	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	cleanup()
}

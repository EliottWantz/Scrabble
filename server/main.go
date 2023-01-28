package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"scrabble/config"
	"scrabble/pkg/api"
)

func main() {
	err := run()
	if err != nil {
		log.Fatalf("error: %v\n", err)
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
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		sig := <-quit
		log.Println(sig, "shutting down")
		errChan <- server.App.Shutdown()
	}()

	return <-errChan
}

package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"scrabble/pkg/api"
)

func main() {
	flag.Parse()

	server := api.NewServer()

	envPort := os.Getenv("PORT")
	if envPort == "" {
		envPort = "3000"
	}
	fmt.Println("Listening on", "addr := 0.0.0.0:", envPort)
	err := server.App.Listen(fmt.Sprintf("0.0.0.0:%s", envPort))
	if err != nil {
		log.Println(err)
		server.WebSocketManager.Shutdown()
		err = server.App.Shutdown()
		if err != nil {
			log.Println(err)
		}
	}
}

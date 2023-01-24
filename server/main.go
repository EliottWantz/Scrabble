package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"scrabble/pkg/api"
)

var port = flag.String("Port", "3000", "The port to listen on")

func main() {
	flag.Parse()

	server := api.NewServer()

	var err error
	envPort := os.Getenv("PORT")
	if envPort != "" {
		err = server.App.Listen(fmt.Sprintf(":%s", envPort))
	} else {
		err = server.App.Listen(fmt.Sprintf("127.0.0.1:%s", *port))
	}
	if err != nil {
		log.Println(err)
		server.WebSocketManager.Shutdown()
		server.App.Shutdown()
	}
}

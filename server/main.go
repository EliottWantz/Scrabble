package main

import (
	"flag"
	"fmt"
	"log"

	"scrabble/pkg/api"
)

var port = flag.String("Port", "3000", "The port to listen on")

func main() {
	flag.Parse()

	server := api.NewServer()

	err := server.App.Listen(fmt.Sprintf("127.0.0.1:%s", *port))
	if err != nil {
		log.Println(err)
		server.WebSocketManager.Shutdown()
		server.App.Shutdown()
	}
}

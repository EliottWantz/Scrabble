package main

import (
	"scrabble/pkg/api"
)

func main() {
	server := api.NewServer()

	server.App.Listen("127.0.0.1:3000")
}

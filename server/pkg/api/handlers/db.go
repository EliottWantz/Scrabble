package handlers

import (
	"github.com/gofiber/fiber/v2"
)

func UploadAvatar() fiber.Handler {
	return func(c *fiber.Ctx) error {
		return c.SendString("vous avez televerser votre avatar")
	}
}

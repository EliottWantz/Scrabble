package user

import (
	"context"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/imagekit-developer/imagekit-go/api/uploader"
	"golang.org/x/exp/slog"
)

func (s *Service) UploadAvatar(ID, avatarUrl string) (string, error) {
	user, err := s.repo.Find(ID)
	if err != nil {
		return "", fiber.NewError(fiber.StatusNotFound, "user not found")
	}

	ctx, close := context.WithTimeout(context.Background(), 10*time.Second)
	defer close()
	useUniqueFileName := false
	res, err := s.ik.Uploader.Upload(ctx, avatarUrl, uploader.UploadParam{
		FileName:          fmt.Sprintf("%s.png", ID),
		UseUniqueFileName: &useUniqueFileName,
	})
	if err != nil {
		return "", fiber.NewError(fiber.StatusInternalServerError, "failed to upload avatar")
	}

	user.AvatarURL = res.Data.Url
	err = s.repo.Update(user)
	if err != nil {
		return "", fiber.NewError(fiber.StatusInternalServerError, "failed to update user")
	}

	slog.Info("uploaded avatar", "avatarUrl", res.Data.Url)

	return res.Data.Url, nil
}

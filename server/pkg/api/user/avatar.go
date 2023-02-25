package user

import (
	"context"
	"fmt"
	"io"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/imagekit-developer/imagekit-go/api/uploader"
	"golang.org/x/exp/slog"
)

type Avatar struct {
	URL    string `json:"url,omitempty"`
	FileID string `json:"fileId,omitempty"`
}

func (s *Service) UploadAvatar(ID string, avatar io.Reader) (string, error) {
	user, err := s.repo.Find(ID)
	if err != nil {
		return "", fiber.NewError(fiber.StatusNotFound, "user not found")
	}

	ctx, close := context.WithTimeout(context.Background(), 10*time.Second)
	defer close()

	if user.Avatar.FileID != "" {
		_, err = s.ik.Media.DeleteFile(ctx, user.Avatar.FileID)
		if err != nil {
			return "", fiber.NewError(fiber.StatusInternalServerError, "failed to delete previous avatar")
		}
	}

	useUniqueFileName := false
	res, err := s.ik.Uploader.Upload(ctx, avatar, uploader.UploadParam{
		FileName:          fmt.Sprintf("%s.png", ID),
		UseUniqueFileName: &useUniqueFileName,
	})
	if err != nil {
		return "", fiber.NewError(fiber.StatusInternalServerError, "failed to upload avatar")
	}

	user.Avatar = Avatar{URL: res.Data.Url, FileID: res.Data.FileId}
	err = s.repo.Update(user)
	if err != nil {
		return "", fiber.NewError(fiber.StatusInternalServerError, "failed to update user")
	}

	slog.Info("uploaded avatar", "URL", res.Data.Url, "FileID", res.Data.FileId)

	return res.Data.Url, nil
}

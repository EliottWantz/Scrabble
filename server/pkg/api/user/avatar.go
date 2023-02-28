package user

import (
	"context"
	"fmt"
	"io"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/uploadcare/uploadcare-go/upload"
	"golang.org/x/exp/slog"
)

type Avatar struct {
	URL    string `json:"url,omitempty"`
	FileID string `json:"fileId,omitempty"`
}

func (s *Service) UploadAvatar(ID string, avatar io.ReadSeeker) (*Avatar, error) {
	user, err := s.repo.Find(ID)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "user not found")
	}

	ctx, close := context.WithTimeout(context.Background(), 10*time.Second)
	defer close()

	params := upload.FileParams{
		Data:        avatar,
		Name:        ID,
		ContentType: "image/png",
	}

	if user.Avatar.FileID != "" {
		_, err = s.fileSvc.Delete(ctx, user.Avatar.FileID)
		if err != nil {
			return nil, fiber.NewError(fiber.StatusInternalServerError, "failed to delete previous avatar")
		}
	}

	fID, err := s.uploadSvc.File(ctx, params)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "failed to upload avatar")
	}
	slog.Info("upload success", "fileID", fID)

	user.Avatar = Avatar{URL: fmt.Sprintf("%s/%s/", s.uploadURL, fID), FileID: fID}
	err = s.repo.Update(user)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "failed to update user")
	}

	return &user.Avatar, nil
}

func (s *Service) DeleteAvatar(ID string) error {
	user, err := s.repo.Find(ID)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "user not found")
	}

	ctx, close := context.WithTimeout(context.Background(), 10*time.Second)
	defer close()

	info, err := s.fileSvc.Delete(ctx, user.Avatar.FileID)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to delete previous avatar")
	}

	user.Avatar = Avatar{URL: "", FileID: ""}
	err = s.repo.Update(user)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to update user")
	}

	slog.Info("avatar deleted", "info", info)

	return nil
}

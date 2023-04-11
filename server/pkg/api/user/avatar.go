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

func (s *Service) UploadAvatar(ID string, req UploadAvatarResquest, strategy UploadAvatarStrategy) (*Avatar, error) {
	user, err := s.Repo.Find(ID)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "user not found")
	}

	ctx, close := context.WithTimeout(context.Background(), 5*time.Second)
	defer close()

	if user.Avatar.FileID != "" {
		_, err = s.fileSvc.Delete(ctx, user.Avatar.FileID)
		if err != nil {
			return nil, fiber.NewError(fiber.StatusInternalServerError, "failed to delete previous avatar")
		}
	}

	if err = strategy(user); err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "failed to upload avatar: "+err.Error())
	}

	err = s.Repo.Update(user)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "failed to update user")
	}

	return &user.Avatar, nil
}

func (s *Service) GetStrategy(fileID, avatarURL string, c *fiber.Ctx) (UploadAvatarStrategy, error) {
	var strategy UploadAvatarStrategy

	if fileID != "" {
		// It's an uploadcare file with url and id
		if avatarURL == "" {
			return nil, fiber.NewError(fiber.StatusBadRequest, "avatar url can't be blank")
		}
		strategy = WithUploadcareFile(avatarURL, fileID)
	} else if avatarURL != "" {
		// dicebear api url
		strategy = WithDicebearURL(s, avatarURL)
	} else {
		// multipart form file
		header, err := c.FormFile("avatar")
		if err != nil {
			return nil, fiber.NewError(fiber.StatusBadRequest, "no avatar url or avatar file can be read: "+err.Error())
		}
		file, err := header.Open()
		if err != nil {
			return nil, fiber.NewError(fiber.StatusInternalServerError, "error opening avatar file: "+err.Error())
		}
		strategy = WithAvatarFile(s, file)
	}

	return strategy, nil
}

type UploadAvatarStrategy func(u *User) error

func WithAvatarFile(s *Service, file io.ReadSeeker) UploadAvatarStrategy {
	return func(u *User) error {
		slog.Info("uploading avatar file")
		ctx, close := context.WithTimeout(context.Background(), 10*time.Second)
		defer close()

		params := upload.FileParams{
			Data:        file,
			Name:        u.ID,
			ContentType: "image/png",
		}

		fID, err := s.uploadSvc.File(ctx, params)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to upload avatar")
		}
		slog.Info("avatar upload success", "fileID", fID)

		u.Avatar = Avatar{URL: fmt.Sprintf("%s/%s/", s.uploadURL, fID), FileID: fID}

		return nil
	}
}

func WithUploadcareFile(fileURL, fileID string) UploadAvatarStrategy {
	return func(u *User) error {
		slog.Info("adding uploadcare avatar to user")
		u.Avatar = Avatar{URL: fileURL, FileID: fileID}
		return nil
	}
}

func WithDicebearURL(s *Service, url string) UploadAvatarStrategy {
	return func(u *User) error {
		slog.Info("uploading dicebear avatar", "name", u.ID)

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		params := upload.FromURLParams{
			URL: url,
		}
		res, err := s.uploadSvc.FromURL(ctx, params)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, err.Error())
		}

		info, ok := res.Info()
		if !ok {
			select {
			case info = <-res.Done():
			case err = <-res.Error():
			}
		}
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, err.Error())
		}

		slog.Info("file uploaded", "fileName", info.FileName, "fileID", info.ID)

		u.Avatar = Avatar{URL: fmt.Sprintf("%s/%s/", s.uploadURL, info.ID), FileID: info.ID}

		return nil
	}
}

// func (s *Service) DeleteAvatar(ID string) error {
// 	user, err := s.Repo.Find(ID)
// 	if err != nil {
// 		return fiber.NewError(fiber.StatusNotFound, "user not found")
// 	}

// 	ctx, close := context.WithTimeout(context.Background(), 10*time.Second)
// 	defer close()

// 	info, err := s.fileSvc.Delete(ctx, user.Avatar.FileID)
// 	if err != nil {
// 		return fiber.NewError(fiber.StatusInternalServerError, "failed to delete previous avatar")
// 	}

// 	user.Avatar = Avatar{URL: "", FileID: ""}
// 	err = s.Repo.Update(user)
// 	if err != nil {
// 		return fiber.NewError(fiber.StatusInternalServerError, "failed to update user")
// 	}

// 	slog.Info("avatar deleted", "info", info)

// 	return nil
// }

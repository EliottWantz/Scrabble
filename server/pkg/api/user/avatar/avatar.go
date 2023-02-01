package avatar

import (
	"context"
	"fmt"
	"time"

	"scrabble/config"

	"github.com/gofiber/fiber/v2"
	"github.com/imagekit-developer/imagekit-go"
	"github.com/imagekit-developer/imagekit-go/api/media"
	"github.com/imagekit-developer/imagekit-go/api/uploader"
	"golang.org/x/exp/slog"
)

type Service struct {
	ik *imagekit.ImageKit
}

func NewService(cfg *config.Config) *Service {
	ik := imagekit.NewFromParams(imagekit.NewParams{
		PrivateKey:  cfg.IMAGEKIT_PRIVATE_KEY,
		PublicKey:   cfg.IMAGEKIT_PUBLIC_KEY,
		UrlEndpoint: cfg.IMAGEKIT_ENDPOINT_URL,
	})

	return &Service{
		ik: ik,
	}
}

func (s *Service) UploadAvatar(avatarUrl, username string) (string, error) {
	ctx, close := context.WithTimeout(context.Background(), 10*time.Second)
	defer close()

	UseUniqueFileName := false // So that the name is equal to what we upload
	res, err := s.ik.Uploader.Upload(ctx, avatarUrl, uploader.UploadParam{
		FileName:          fmt.Sprintf("%s.png", username),
		UseUniqueFileName: &UseUniqueFileName,
	})
	if err != nil {
		return "", err
	}

	slog.Info("uploaded avatar", "avatarUrl", res.Data.Url)

	return res.Data.Url, nil
}

func (s *Service) GetAvatar(username string) (string, error) {
	ctx, close := context.WithTimeout(context.Background(), 10*time.Second)
	defer close()

	res, err := s.ik.Media.Files(ctx, media.FilesParam{
		SearchQuery: fmt.Sprintf("name=%s.png", username),
	})
	if err != nil {
		return "", err
	}

	for _, f := range res.Data {
		slog.Info("got avatar", "url", f.Url)
	}

	if res.Data == nil || len(res.Data) == 0 {
		return "", fiber.NewError(fiber.StatusUnprocessableEntity, fmt.Sprintf("no avatar found for %s", username))
	}

	return res.Data[0].Url, nil
}

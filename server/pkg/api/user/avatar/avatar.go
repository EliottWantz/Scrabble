package avatar

import (
	"context"
	"fmt"
	"time"

	"scrabble/config"

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

	res, err := s.ik.Uploader.Upload(ctx, avatarUrl, uploader.UploadParam{
		FileName: fmt.Sprintf("%s.jpg", username),
	})
	if err != nil {
		return "", err
	}

	slog.Info("uploaded avatar", "res", res)

	return res.Data.Url, nil
}

func (s *Service) GetAvatar(username string) (*media.FilesResponse, error) {
	ctx, close := context.WithTimeout(context.Background(), 10*time.Second)
	defer close()

	res, err := s.ik.Media.Files(ctx, media.FilesParam{
		SearchQuery: "name=" + username + ",jpg",
	})
	if err != nil {
		return nil, err
	}

	slog.Info("got avatar", "res", res)

	return res, nil
}

package user

import (
	"context"
	"fmt"
	"time"

	"github.com/imagekit-developer/imagekit-go/api/uploader"
	"golang.org/x/exp/slog"
)

func (s *Service) UploadAvatar(ID, avatarUrl string) (string, error) {
	user, err := s.repo.Find(ID)
	if err != nil {
		slog.Error("find user "+ID, err)
		return "", err
	}

	ctx, close := context.WithTimeout(context.Background(), 10*time.Second)
	defer close()
	useUniqueFileName := false
	res, err := s.ik.Uploader.Upload(ctx, avatarUrl, uploader.UploadParam{
		FileName:          fmt.Sprintf("%s.png", ID),
		UseUniqueFileName: &useUniqueFileName,
	})
	if err != nil {
		return "", err
	}

	user.AvatarURL = res.Data.Url
	err = s.repo.Update(user)
	if err != nil {
		return "", err
	}

	slog.Info("uploaded avatar", "avatarUrl", res.Data.Url)

	return res.Data.Url, nil
}

// func (s *Service) GetAvatar(username string) (string, error) {
// 	user, err := s.repo.Find(username)
// 	if err != nil {
// 		return "", err
// 	}

// 	return user.AvatarURL, nil
// }

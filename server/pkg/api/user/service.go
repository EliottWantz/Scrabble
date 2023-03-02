package user

import (
	"context"
	"errors"
	"fmt"
	"io"
	"time"

	"scrabble/config"
	"scrabble/pkg/api/auth"
	"scrabble/pkg/api/room"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/uploadcare/uploadcare-go/file"
	"github.com/uploadcare/uploadcare-go/ucare"
	"github.com/uploadcare/uploadcare-go/upload"
	"golang.org/x/exp/slog"
)

var (
	ErrPasswordMismatch  = errors.New("password mismatch")
	ErrUserAlreadyExists = errors.New("user already exists")
	ErrUserNotFound      = errors.New("user not found")
)

type Service struct {
	Repo      *Repository
	uploadSvc upload.Service
	fileSvc   file.Service
	uploadURL string
	RoomSvc   *room.Service
}

func NewService(cfg *config.Config, repo *Repository, roomSvc *room.Service) (*Service, error) {
	creds := ucare.APICreds{
		SecretKey: cfg.UPLOAD_CARE_SECRET_KEY,
		PublicKey: cfg.UPLOAD_CARE_PUBLIC_KEY,
	}

	conf := &ucare.Config{
		SignBasedAuthentication: true,
		APIVersion:              ucare.APIv06,
	}

	client, err := ucare.NewClient(creds, conf)
	if err != nil {
		return nil, err
	}

	return &Service{
		Repo:      repo,
		uploadSvc: upload.NewService(client),
		fileSvc:   file.NewService(client),
		uploadURL: cfg.UPLOAD_CARE_UPLOAD_URL,
		RoomSvc:   roomSvc,
	}, nil
}

func (s *Service) SignUp(req SignupRequest, avatar io.ReadSeeker) (*User, error) {
	if _, err := s.Repo.FindByUsername(req.Username); err == nil {
		return nil, fiber.NewError(fiber.StatusUnprocessableEntity, "username already exists")
	}

	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "failed to hash password")
	}

	ID := uuid.NewString()
	u := &User{
		ID:              ID,
		Username:        req.Username,
		HashedPassword:  hashedPassword,
		Email:           req.Email,
		Avatar:          Avatar{URL: req.AvatarURL, FileID: req.FileID},
		JoinedChatRooms: make([]string, 0),
	}

	// Upload avatar
	if avatar != nil {
		slog.Info("uploading avatar")
		ctx, close := context.WithTimeout(context.Background(), 10*time.Second)
		defer close()

		params := upload.FileParams{
			Data:        avatar,
			Name:        ID,
			ContentType: "image/png",
		}

		fID, err := s.uploadSvc.File(ctx, params)
		if err != nil {
			return nil, fiber.NewError(fiber.StatusInternalServerError, "failed to upload avatar")
		}
		slog.Info("avatar upload success", "fileID", fID)

		u.Avatar = Avatar{URL: fmt.Sprintf("%s/%s/", s.uploadURL, fID), FileID: fID}
	}

	if err := s.Repo.Insert(u); err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "failed to insert user: "+err.Error())
	}

	// Create and join own room
	_, err = s.RoomSvc.CreateRoom(u.ID, u.Username, u.ID)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "failed to create and join own room: "+err.Error())
	}
	// Join global room
	err = s.RoomSvc.AddUser("global", u.ID)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "failed to join global room: "+err.Error())
	}

	return u, nil
}

func (s *Service) Login(username, password string) (*User, error) {
	u, err := s.Repo.FindByUsername(username)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "user not found")
	}

	if !auth.PasswordsMatch(password, u.HashedPassword) {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "password mismatch")
	}

	return u, nil
}

func (s *Service) Logout(ID string) error {
	if !s.Repo.Has(ID) {
		return fiber.NewError(fiber.StatusNotFound, "user not found")
	}

	if err := s.Repo.Delete(ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to delete user")
	}

	slog.Info("Logout user", "id", ID)

	return nil
}

func (s *Service) GetUser(ID string) (*User, error) {
	u, err := s.Repo.Find(ID)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "user not found")
	}

	return u, nil
}

func (s *Service) JoinRoom(roomID, userID string) error {
	return s.Repo.AddJoinedRoom(roomID, userID)
}

func (s *Service) LeaveRoom(roomID, userID string) error {
	return s.Repo.RemoveJoinedRoom(roomID, userID)
}

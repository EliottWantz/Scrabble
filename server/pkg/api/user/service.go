package user

import (
	"errors"
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
	Repo           *Repository
	uploadSvc      upload.Service
	fileSvc        file.Service
	uploadURL      string
	RoomSvc        *room.Service
	DefaultAvatars []*Avatar
	NewUserChan    chan *User
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
		Repo:        repo,
		uploadSvc:   upload.NewService(client),
		fileSvc:     file.NewService(client),
		uploadURL:   cfg.UPLOAD_CARE_UPLOAD_URL,
		RoomSvc:     roomSvc,
		NewUserChan: make(chan *User, 10),
		DefaultAvatars: []*Avatar{
			{
				URL:    "https://ucarecdn.com/3dfe6a52-849b-4a64-85c6-1274731595ac/",
				FileID: "3dfe6a52-849b-4a64-85c6-1274731595ac",
			},
			{
				URL:    "https://ucarecdn.com/add70d69-c5c0-46b3-9a36-10c62fb0bf61/",
				FileID: "add70d69-c5c0-46b3-9a36-10c62fb0bf61",
			},
			{
				URL:    "https://ucarecdn.com/a706a6af-c90b-4e81-99d6-e990386952a4/",
				FileID: "a706a6af-c90b-4e81-99d6-e990386952a4",
			},
			{
				URL:    "https://ucarecdn.com/ed62dd60-3d8c-4d3d-8e55-54005ecbdf20/",
				FileID: "ed62dd60-3d8c-4d3d-8e55-54005ecbdf20",
			},
			{
				URL:    "https://ucarecdn.com/4341937c-287d-44bb-bde0-6d4e504fa0ad/",
				FileID: "4341937c-287d-44bb-bde0-6d4e504fa0ad",
			},
			{
				URL:    "https://ucarecdn.com/17e31591-4705-4293-b659-0c5114cf5d60/",
				FileID: "17e31591-4705-4293-b659-0c5114cf5d60",
			},
		},
	}, nil
}

func (s *Service) SignUp(username, password, email string, uploadAvatar UploadAvatarStrategy) (*User, error) {
	if _, err := s.Repo.FindByUsername(username); err == nil {
		return nil, fiber.NewError(fiber.StatusUnprocessableEntity, "username already exists")
	}

	hashedPassword, err := auth.HashPassword(password)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "failed to hash password")
	}

	ID := uuid.NewString()
	Preferences := Preferences{
		Theme:    "light",
		Language: "fr",
	}
	u := &User{
		ID:              ID,
		Username:        username,
		HashedPassword:  hashedPassword,
		Email:           email,
		Preferences:     Preferences,
		JoinedChatRooms: make([]string, 0),
		JoinedDMRooms:   make([]string, 0),
		Friends:         make([]string, 0),
		PendingRequests: make([]string, 0),
	}

	// Add avatar strategy
	if err = uploadAvatar(u); err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "failed to upload avatar: "+err.Error())
	}

	if err := s.Repo.Insert(u); err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "failed to insert user: "+err.Error())
	}

	s.NewUserChan <- u

	// Join global room
	err = s.RoomSvc.Repo.AddUser("global", u.ID)
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

	if u.IsConnected {
		return nil, fiber.NewError(fiber.StatusForbidden, "user already connected")
	}

	if !auth.PasswordsMatch(password, u.HashedPassword) {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "password mismatch")
	}
	return u, s.AddNetworkingLog(u, "Login", time.Now().UnixMilli())
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

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
				URL:    "https://ucarecdn.com/fd170930-3817-4867-804d-cceefce3018f/",
				FileID: "fd170930-3817-4867-804d-cceefce3018f/",
			},
			{
				URL:    "https://ucarecdn.com/92cb19a9-c28a-47c1-8760-24cafe3d87cb/",
				FileID: "92cb19a9-c28a-47c1-8760-24cafe3d87cb",
			},
			{
				URL:    "https://ucarecdn.com/5112aefb-526b-4549-ba33-b0c0e45e035b/",
				FileID: "5112aefb-526b-4549-ba33-b0c0e45e035b",
			},
			{
				URL:    "https://ucarecdn.com/98251cca-131b-4c58-b8c7-04c62472daea/",
				FileID: "98251cca-131b-4c58-b8c7-04c62472daea",
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

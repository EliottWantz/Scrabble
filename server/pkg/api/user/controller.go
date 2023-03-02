package user

import (
	"scrabble/pkg/api/auth"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/exp/slog"
)

type Controller struct {
	svc     *Service
	authSvc *auth.Service
}

func NewController(svc *Service, authSvc *auth.Service) *Controller {
	return &Controller{svc: svc, authSvc: authSvc}
}

type SignupRequest struct {
	Username  string `json:"username,omitempty"`
	Password  string `json:"password,omitempty"`
	Email     string `json:"email,omitempty"`
	AvatarURL string `json:"avatarUrl,omitempty"`
	FileID    string `json:"fileId,omitempty"`
}

type SignupResponse struct {
	User  *User  `json:"user,omitempty"`
	Token string `json:"token,omitempty"`
}

// Sign up a new user
func (ctrl *Controller) SignUp(c *fiber.Ctx) error {
	req := SignupRequest{}
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "decode req: "+err.Error())
	}

	if req.Username == "" {
		return fiber.NewError(fiber.StatusBadRequest, "username can't be blank")
	}
	if req.Password == "" {
		return fiber.NewError(fiber.StatusBadRequest, "password can't be blank")
	}
	if req.Email == "" {
		return fiber.NewError(fiber.StatusBadRequest, "email can't be blank")
	}

	var strategy UploadAvatarStrategy

	if req.FileID != "" {
		// It's an uploadcare file with url and id
		if req.AvatarURL == "" {
			return fiber.NewError(fiber.StatusBadRequest, "avatar url can't be blank")
		}
		strategy = WithUploadcareFile(req.AvatarURL, req.FileID)
	} else if req.AvatarURL != "" {
		// dicebear api url
		strategy = WithDicebearURL(ctrl.svc, req.AvatarURL)
	} else {
		// multipart form file
		header, err := c.FormFile("avatar")
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "no avatar url or avatar file can be read: "+err.Error())
		}
		file, err := header.Open()
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "error opening avatar file: "+err.Error())
		}
		strategy = WithAvatarFile(ctrl.svc, file)
	}

	user, err := ctrl.svc.SignUp(req.Username, req.Password, req.Email, strategy)
	if err != nil {
		return err
	}

	token, err := ctrl.authSvc.GenerateJWT(user.ID)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to generate token")
	}

	return c.Status(fiber.StatusCreated).JSON(
		SignupResponse{
			User:  user,
			Token: token,
		},
	)
}

type LoginRequest struct {
	Username string `json:"username,omitempty"`
	Password string `json:"password,omitempty"`
	Token    string `json:"token,omitempty"`
}

type LoginResponse struct {
	User  *User  `json:"user,omitempty"`
	Token string `json:"token,omitempty"`
}

func (ctrl *Controller) Login(c *fiber.Ctx) error {
	var req LoginRequest
	err := c.BodyParser(&req)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	slog.Info("login request", "req", req)

	var (
		u     *User
		token string
	)

	if req.Username != "" && req.Password != "" {
		// Login with username and password
		if u, err = ctrl.svc.Login(req.Username, req.Password); err != nil {
			return err
		}

		token, err = ctrl.authSvc.GenerateJWT(u.ID)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to generate token")
		}
	} else if req.Token != "" {
		// Login with token
		claims, err := ctrl.authSvc.VerifyJWT(req.Token)
		if err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}

		// Refresh token
		if token, err = ctrl.authSvc.RefreshJWT(req.Token, claims); err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to refresh token")
		}

		if u, err = ctrl.svc.GetUser(claims.UserID); err != nil {
			return err
		}
	}

	slog.Info("response", "user", u, "token", token)

	return c.JSON(LoginResponse{
		User:  u,
		Token: token,
	})
}

type GetUserResponse struct {
	User *User `json:"user,omitempty"`
}

func (ctrl *Controller) GetUser(c *fiber.Ctx) error {
	ID := c.Params("id")
	if ID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "no id given")
	}

	user, err := ctrl.svc.GetUser(ID)
	if err != nil {
		return err
	}

	return c.JSON(GetUserResponse{
		User: user,
	})
}

type UploadAvatarResponse struct {
	*Avatar
}

func (ctrl *Controller) UploadAvatar(c *fiber.Ctx) error {
	ID := c.Params("id")
	if ID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "no user id given")
	}

	fileHeader, err := c.FormFile("avatar")
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "no avatar given")
	}
	file, err := fileHeader.Open()
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	avatar, err := ctrl.svc.UploadAvatar(ID, file)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusCreated).JSON(
		UploadAvatarResponse{
			avatar,
		},
	)
}

func (ctrl *Controller) DeleteAvatar(c *fiber.Ctx) error {
	ID := c.Params("id")
	if ID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "no user id given")
	}

	err := ctrl.svc.DeleteAvatar(ID)
	if err != nil {
		return err
	}

	return c.SendStatus(fiber.StatusNoContent)
}

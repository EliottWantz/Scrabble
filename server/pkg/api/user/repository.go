package user

import (
	"errors"
	"sync"

	"golang.org/x/exp/slog"
)

var (
	ErrUserAlreadyExists = errors.New("user already exists")
	ErrUserNotFound      = errors.New("user not found")
)

type Repository struct {
	users map[string]*User
	mu    sync.RWMutex
}

func NewRepository() *Repository {
	return &Repository{
		users: make(map[string]*User),
	}
}

func (r *Repository) Find(ID string) (*User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	u, ok := r.users[ID]
	if !ok {
		return nil, ErrUserNotFound
	}

	slog.Info("Find user", "user", u.Username)

	return u, nil
}

func (r *Repository) Insert(u *User) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	_, ok := r.users[u.ID]
	if ok {
		return ErrUserAlreadyExists
	}

	slog.Info("Inserted user", "user", u.Username)

	return nil
}

func (r *Repository) Update(u *User) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.users[u.ID] = u
	slog.Info("Updated user", "user", u.Username)

	return nil
}

func (r *Repository) Delete(ID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.users, ID)
	slog.Info("Deleted user", "user", ID)

	return nil
}

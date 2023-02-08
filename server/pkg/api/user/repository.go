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
	users map[string]*User // map[username]*User
	mu    sync.RWMutex
}

func NewRepository() *Repository {
	return &Repository{
		users: make(map[string]*User),
	}
}

func (r *Repository) Has(username string) bool {
	r.mu.RLock()
	defer r.mu.RUnlock()
	_, ok := r.users[username]
	return ok
}

func (r *Repository) Find(username string) (*User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	u, ok := r.users[username]
	if !ok {
		return nil, ErrUserNotFound
	}

	slog.Info("Find user", "user", u.Username)

	return u, nil
}

func (r *Repository) Insert(u *User) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	_, ok := r.users[u.Username]
	if ok {
		return ErrUserAlreadyExists
	}

	r.users[u.Username] = u

	slog.Info("Inserted user", "user", u.Username)

	return nil
}

func (r *Repository) Update(u *User) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.users[u.Username] = u
	slog.Info("Updated user", "user", u.Username)

	return nil
}

func (r *Repository) Delete(username string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.users, username)
	slog.Info("Deleted user", "user", username)

	return nil
}

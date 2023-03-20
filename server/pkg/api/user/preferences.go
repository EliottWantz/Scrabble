package user

type Preferences struct {
	Theme    string `json:"theme,omitempty"`
	Language string `json:"language,omitempty"`
}

func (s *Service) UpdatePreferences(u *User, p Preferences) {
	u.Preferences = p
	s.Repo.Update(u)
}

package user

type Preferences struct {
	Theme    string `json:"theme,omitempty,default:'light'"`
	Language string `json:"language,omitempty,default:'en'"`
}

func (s *Service) UpdatePreferences(u *User, p Preferences) {
	u.Preferences = p
	s.Repo.Update(u)
}

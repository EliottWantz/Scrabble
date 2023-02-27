package config

import (
	"fmt"

	"github.com/caarlos0/env/v6"
)

type Config struct {
	MONGODB_URI            string `env:"MONGODB_URI,notEmpty"`
	MONGODB_NAME           string `env:"MONGODB_NAME,notEmpty"`
	UPLOAD_CARE_SECRET_KEY string `env:"UPLOAD_CARE_SECRET_KEY,notEmpty"`
	UPLOAD_CARE_PUBLIC_KEY string `env:"UPLOAD_CARE_PUBLIC_KEY,notEmpty"`
	UPLOAD_CARE_UPLOAD_URL string `env:"UPLOAD_CARE_UPLOAD_URL,notEmpty"`
	JWT_SIGN_KEY           string `env:"JWT_SIGN_KEY,notEmpty"`
	PORT                   string `env:"PORT" envDefault:"3000"`
}

func LoadConfig() (*Config, error) {
	var cfg Config
	if err := env.Parse(&cfg); err != nil {
		return nil, err
	}

	fmt.Printf("%+v\n", cfg)

	return &cfg, nil
}

package config

import (
	"fmt"

	"github.com/caarlos0/env/v6"
)

type Config struct {
	MONGODB_URI           string `env:"MONGODB_URI,notEmpty"`
	MONGODB_NAME          string `env:"MONGODB_NAME,notEmpty"`
	IMAGEKIT_ENDPOINT_URL string `env:"IMAGEKIT_ENDPOINT_URL,notEmpty"`
	IMAGEKIT_PUBLIC_KEY   string `env:"IMAGEKIT_PUBLIC_KEY,notEmpty"`
	IMAGEKIT_PRIVATE_KEY  string `env:"IMAGEKIT_PRIVATE_KEY,notEmpty"`
	PORT                  string `env:"PORT" envDefault:"3000"`
}

func LoadConfig() (*Config, error) {
	var cfg Config
	if err := env.Parse(&cfg); err != nil {
		return nil, err
	}

	fmt.Printf("%+v\n", cfg)

	return &cfg, nil
}

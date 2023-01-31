package config

import (
	"fmt"

	"github.com/caarlos0/env/v6"
)

type Config struct {
	MONGODB_URI  string `env:"MONGODB_URI,notEmpty"`
	MONGODB_NAME string `env:"MONGODB_NAME,notEmpty"`
	PORT         string `env:"PORT" envDefault:"3000"`
}

func LoadConfig() (Config, error) {
	var cfg Config
	if err := env.Parse(&cfg); err != nil {
		return Config{}, err
	}

	fmt.Printf("%+v\n", cfg)

	return cfg, nil
}

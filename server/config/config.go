package config

import (
	"fmt"

	"github.com/caarlos0/env/v6"
)

type Config struct {
	PORT string `env:"PORT" envDefault:"3000"`
}

func LoadConfig() (*Config, error) {
	var cfg Config
	if err := env.Parse(&cfg); err != nil {
		return nil, err
	}

	fmt.Printf("%+v\n", cfg)

	return &cfg, nil
}

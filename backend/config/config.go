package config

import (
	"fmt"
	"os"
)

// Config はアプリケーション設定を保持する
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
}

// ServerConfig はサーバー設定
type ServerConfig struct {
	Port string
	Host string
}

// DatabaseConfig はデータベース設定
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// Load は環境変数から設定を読み込む
func Load() *Config {
	return &Config{
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"),
			Host: getEnv("SERVER_HOST", "0.0.0.0"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "postgres"),
			DBName:   getEnv("DB_NAME", "flowcore"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
	}
}

// DSN はPostgreSQL接続文字列を返す
func (c *DatabaseConfig) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode,
	)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

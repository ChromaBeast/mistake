package config

import (
	"os"
	"strconv"
)

type PlanConfig struct {
	Name         string
	AmountMinor  int64
	MaxDocuments int
}

type Config struct {
	Port           int
	JWTSecret      string
	Environment    string
	StorageDir     string
	WorkerCount    int
	AllowedOrigins       []string
	DatabaseURL          string
	GeminiAPIKey         string
	GeminiFrontierModel  string
	GeminiStandardModel  string
	Plans                map[string]PlanConfig
}

func LoadConfig() *Config {
	port := 8080
	if portStr := os.Getenv("PORT"); portStr != "" {
		if p, err := strconv.Atoi(portStr); err == nil {
			port = p
		}
	}

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "mistake-secure-jwt-secret-key-production-change-me"
	}

	env := os.Getenv("ENV")
	if env == "" {
		env = "development"
	}

	storageDir := os.Getenv("STORAGE_DIR")
	if storageDir == "" {
		storageDir = "./data/uploads"
	}

	workerCount := 4
	if wcStr := os.Getenv("WORKER_COUNT"); wcStr != "" {
		if wc, err := strconv.Atoi(wcStr); err == nil {
			workerCount = wc
		}
	}

	dbURL := os.Getenv("DATABASE_URL")
	geminiAPIKey := os.Getenv("GEMINI_API_KEY")
	frontierModel := os.Getenv("GEMINI_FRONTIER_MODEL")
	if frontierModel == "" {
		frontierModel = "gemini-3.7-flash"
	}
	standardModel := os.Getenv("GEMINI_STANDARD_MODEL")
	if standardModel == "" {
		standardModel = "gemini-3.5-flash-lite"
	}

	return &Config{
		Port:                port,
		JWTSecret:           secret,
		Environment:         env,
		StorageDir:          storageDir,
		WorkerCount:         workerCount,
		AllowedOrigins:      []string{"http://localhost:3000"},
		DatabaseURL:         dbURL,
		GeminiAPIKey:        geminiAPIKey,
		GeminiFrontierModel: frontierModel,
		GeminiStandardModel: standardModel,
		Plans: map[string]PlanConfig{
			"starter":    {Name: "Starter Plan", AmountMinor: 490000, MaxDocuments: 1000},
			"growth":     {Name: "Growth Plan", AmountMinor: 1490000, MaxDocuments: 10000},
			"enterprise": {Name: "Enterprise Plan", AmountMinor: 5000000, MaxDocuments: 100000},
		},
	}
}



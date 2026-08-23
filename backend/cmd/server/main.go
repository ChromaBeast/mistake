package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"mistake-backend/internal/config"
	"mistake-backend/internal/pipeline"
	"mistake-backend/internal/router"
	"mistake-backend/internal/storage"
)

func main() {
	cfg := config.LoadConfig()
	log.Printf("Starting Mistake Backend on port %d (%s)...", cfg.Port, cfg.Environment)

	var store storage.Store
	if cfg.DatabaseURL != "" {
		log.Println("DATABASE_URL detected. Connecting to PostgreSQL...")
		pgStore, err := storage.NewPostgresStore(context.Background(), cfg.DatabaseURL)
		if err != nil {
			log.Fatalf("Failed to connect to PostgreSQL: %v", err)
		}
		defer pgStore.Close()

		if err := pgStore.AutoMigrate(context.Background()); err != nil {
			log.Fatalf("PostgreSQL migration failed: %v", err)
		}
		store = pgStore
	} else {
		log.Println("DATABASE_URL not set. Running with In-Memory store.")
		store = storage.NewMemoryStore()
	}

	pipe := pipeline.NewPipeline(store)
	workerPool := pipeline.NewWorkerPool(pipe, cfg.WorkerCount, 100)
	workerPool.Start()
	defer workerPool.Stop()

	handler := router.SetupRouter(store, pipe, workerPool, cfg)

	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to listen: %v", err)
		}
	}()

	log.Printf("Server listening at http://localhost:%d", cfg.Port)

	// Graceful shutdown handling
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server gracefully...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	log.Println("Server exited cleanly.")
}

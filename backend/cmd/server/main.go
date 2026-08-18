package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"mistake-backend/internal/config"
	"mistake-backend/internal/pipeline"
	"mistake-backend/internal/router"
	"mistake-backend/internal/seed"
	"mistake-backend/internal/storage"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	seedFlag := flag.Bool("seed", true, "Seed database with sample B2B records on startup")
	flag.Parse()

	cfg := config.LoadConfig()
	log.Printf("Starting Mistake Backend on port %d (%s)...", cfg.Port, cfg.Environment)

	store := storage.NewMemoryStore()
	pipe := pipeline.NewPipeline(store)
	workerPool := pipeline.NewWorkerPool(pipe, cfg.WorkerCount, 100)
	workerPool.Start()
	defer workerPool.Stop()

	if *seedFlag {
		log.Println("Seeding initial B2B sample data...")
		_, _, err := seed.SeedDatabase(context.Background(), store)
		if err != nil {
			log.Printf("Warning: Seeding failed: %v", err)
		} else {
			log.Println("Seeding completed successfully.")
		}
	}

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

package main

import (
	"mistake-backend/internal/config"
	"mistake-backend/internal/pipeline"
	"mistake-backend/internal/router"
	"mistake-backend/internal/storage"
	"net/http"
)

// SetupRouter delegates to internal/router.SetupRouter.
func SetupRouter(store storage.Store, p *pipeline.Pipeline, wp *pipeline.WorkerPool, cfg *config.Config) http.Handler {
	return router.SetupRouter(store, p, wp, cfg)
}

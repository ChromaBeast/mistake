package test

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"mistake-backend/internal/config"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/middleware"
	"mistake-backend/internal/pipeline"
	"mistake-backend/internal/router"
	"mistake-backend/internal/storage"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestRBACHTTPMiddlewareEnforcement(t *testing.T) {
	cfg := config.LoadConfig()
	cfg.JWTSecret = "rbac-http-secret-789"

	store := storage.NewMemoryStore()
	pipe := pipeline.NewPipeline(store)
	workerPool := pipeline.NewWorkerPool(pipe, 1, 10)
	workerPool.Start()
	defer workerPool.Stop()

	tenantID := "tenant-rbac-http"
	now := time.Now().UTC()
	_ = store.CreateTenant(context.Background(), &domain.Tenant{
		ID: tenantID, Name: "RBAC Corp", Status: domain.TenantStatusActive, CreatedAt: now, UpdatedAt: now,
	})

	viewerUser := &domain.User{
		ID:        "user-viewer-1",
		TenantID:  tenantID,
		Email:     "viewer_corp@example.com",
		Role:      domain.RoleViewer,
		Status:    domain.UserStatusActive,
		CreatedAt: now,
		UpdatedAt: now,
	}
	_ = store.CreateUser(context.Background(), viewerUser)

	adminUser := &domain.User{
		ID:        "user-admin-1",
		TenantID:  tenantID,
		Email:     "admin_corp@example.com",
		Role:      domain.RoleAdmin,
		Status:    domain.UserStatusActive,
		CreatedAt: now,
		UpdatedAt: now,
	}
	_ = store.CreateUser(context.Background(), adminUser)

	r := router.SetupRouter(store, pipe, workerPool, cfg)

	viewerToken, _ := middleware.GenerateToken(cfg.JWTSecret, viewerUser, time.Hour)
	adminToken, _ := middleware.GenerateToken(cfg.JWTSecret, adminUser, time.Hour)

	// 1. Viewer trying to PATCH tenant (Requires PermTenantWrite -> Admin/Owner only)
	patchBody, _ := json.Marshal(map[string]string{"name": "Hacked Tenant"})
	reqViewer := httptest.NewRequest(http.MethodPatch, "/api/v1/tenant", bytes.NewReader(patchBody))
	reqViewer.Header.Set("Authorization", fmt.Sprintf("Bearer %s", viewerToken))
	reqViewer.Header.Set("Content-Type", "application/json")
	recViewer := httptest.NewRecorder()
	r.ServeHTTP(recViewer, reqViewer)

	if recViewer.Code != http.StatusForbidden {
		t.Errorf("expected 403 Forbidden for Viewer patching tenant, got %d", recViewer.Code)
	}

	// 2. Admin trying to PATCH tenant (Admin has PermTenantWrite)
	reqAdmin := httptest.NewRequest(http.MethodPatch, "/api/v1/tenant", bytes.NewReader(patchBody))
	reqAdmin.Header.Set("Authorization", fmt.Sprintf("Bearer %s", adminToken))
	reqAdmin.Header.Set("Content-Type", "application/json")
	recAdmin := httptest.NewRecorder()
	r.ServeHTTP(recAdmin, reqAdmin)

	if recAdmin.Code != http.StatusOK {
		t.Errorf("expected 200 OK for Admin patching tenant, got %d: %s", recAdmin.Code, recAdmin.Body.String())
	}
}

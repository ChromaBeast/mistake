package test

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"mistake-backend/internal/config"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/handlers"
	"mistake-backend/internal/middleware"
	"mistake-backend/internal/pipeline"
	"mistake-backend/internal/router"
	"mistake-backend/internal/storage"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func TestRefreshTokenFlowAndRotation(t *testing.T) {
	cfg := config.LoadConfig()
	cfg.JWTSecret = "refresh-test-secret-999"

	store := storage.NewMemoryStore()
	pipe := pipeline.NewPipeline(store)
	workerPool := pipeline.NewWorkerPool(pipe, 1, 10)
	workerPool.Start()
	defer workerPool.Stop()

	tenantID := "tenant-refresh-test"
	now := time.Now().UTC()
	_ = store.CreateTenant(context.Background(), &domain.Tenant{
		ID: tenantID, Name: "Token Refresh Org", Status: domain.TenantStatusActive, CreatedAt: now, UpdatedAt: now,
	})

	hashBytes, _ := bcrypt.GenerateFromPassword([]byte("SecureSecret123!"), bcrypt.DefaultCost)
	user := &domain.User{
		ID:           "user-refresh-1",
		TenantID:     tenantID,
		Email:        "refresh_user@example.com",
		Name:         "Token User",
		PasswordHash: string(hashBytes),
		Role:         domain.RoleAnalyst,
		Status:       domain.UserStatusActive,
		CreatedAt:    now,
		UpdatedAt:    now,
	}
	_ = store.CreateUser(context.Background(), user)

	r := router.SetupRouter(store, pipe, workerPool, cfg)

	// Step 1: Login and obtain token pair
	loginBody, _ := json.Marshal(map[string]string{
		"email":    "refresh_user@example.com",
		"password": "SecureSecret123!",
	})
	reqLogin := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewReader(loginBody))
	reqLogin.Header.Set("Content-Type", "application/json")
	recLogin := httptest.NewRecorder()
	r.ServeHTTP(recLogin, reqLogin)

	if recLogin.Code != http.StatusOK {
		t.Fatalf("expected 200 on login, got %d", recLogin.Code)
	}

	var authResp handlers.AuthResponse
	_ = json.Unmarshal(recLogin.Body.Bytes(), &authResp)
	if authResp.Token == "" || authResp.RefreshToken == "" {
		t.Fatalf("expected both access and refresh tokens, got %+v", authResp)
	}

	initialAccessToken := authResp.Token
	initialRefreshToken := authResp.RefreshToken

	// Step 2: Access protected route with initial access token
	reqDash := httptest.NewRequest(http.MethodGet, "/api/v1/dashboard/summary", nil)
	reqDash.Header.Set("Authorization", fmt.Sprintf("Bearer %s", initialAccessToken))
	recDash := httptest.NewRecorder()
	r.ServeHTTP(recDash, reqDash)

	if recDash.Code != http.StatusOK {
		t.Errorf("expected 200 accessing dashboard with access token, got %d", recDash.Code)
	}

	// Step 3: Refresh the token using initialRefreshToken
	refreshBody, _ := json.Marshal(map[string]string{
		"refresh_token": initialRefreshToken,
	})
	reqRefresh := httptest.NewRequest(http.MethodPost, "/api/v1/auth/refresh", bytes.NewReader(refreshBody))
	reqRefresh.Header.Set("Content-Type", "application/json")
	recRefresh := httptest.NewRecorder()
	r.ServeHTTP(recRefresh, reqRefresh)

	if recRefresh.Code != http.StatusOK {
		t.Fatalf("expected 200 on refresh, got %d: %s", recRefresh.Code, recRefresh.Body.String())
	}

	var rotatedResp handlers.AuthResponse
	_ = json.Unmarshal(recRefresh.Body.Bytes(), &rotatedResp)
	if rotatedResp.Token == "" || rotatedResp.RefreshToken == "" {
		t.Fatalf("expected rotated tokens, got %+v", rotatedResp)
	}
	if rotatedResp.RefreshToken == initialRefreshToken {
		t.Errorf("expected refresh token to be rotated to a new value")
	}

	// Step 4: Token Rotation Replay Prevention - Re-using old refresh token must be REJECTED
	reqReplay := httptest.NewRequest(http.MethodPost, "/api/v1/auth/refresh", bytes.NewReader(refreshBody))
	reqReplay.Header.Set("Content-Type", "application/json")
	recReplay := httptest.NewRecorder()
	r.ServeHTTP(recReplay, reqReplay)

	if recReplay.Code != http.StatusUnauthorized {
		t.Errorf("expected 401 on replay of old refresh token, got %d", recReplay.Code)
	}

	// Step 5: Verify new access token works for protected API
	reqNewAuth := httptest.NewRequest(http.MethodGet, "/api/v1/dashboard/summary", nil)
	reqNewAuth.Header.Set("Authorization", fmt.Sprintf("Bearer %s", rotatedResp.Token))
	recNewAuth := httptest.NewRecorder()
	r.ServeHTTP(recNewAuth, reqNewAuth)

	if recNewAuth.Code != http.StatusOK {
		t.Errorf("expected 200 with new rotated access token, got %d", recNewAuth.Code)
	}

	// Step 6: Verify claims on new access token
	claims, err := middleware.ValidateToken(cfg.JWTSecret, rotatedResp.Token)
	if err != nil || claims.UserID != user.ID || claims.Role != domain.RoleAnalyst {
		t.Errorf("invalid claims on rotated access token: %v", err)
	}
}

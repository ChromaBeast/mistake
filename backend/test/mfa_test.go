package test

import (
	"bytes"
	"context"
	"encoding/json"
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

	"github.com/pquerna/otp/totp"
	"golang.org/x/crypto/bcrypt"
)

func TestMFAVerificationFlow(t *testing.T) {
	cfg := config.LoadConfig()
	cfg.JWTSecret = "mfa-test-secret-456"

	store := storage.NewMemoryStore()
	pipe := pipeline.NewPipeline(store)
	workerPool := pipeline.NewWorkerPool(pipe, 1, 10)
	workerPool.Start()
	defer workerPool.Stop()

	tenantID := "tenant-mfa-test"
	now := time.Now().UTC()
	_ = store.CreateTenant(context.Background(), &domain.Tenant{
		ID: tenantID, Name: "MFA Org", Status: domain.TenantStatusActive, CreatedAt: now, UpdatedAt: now,
	})

	// Generate a valid TOTP key
	totpKey, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "MistakeTest",
		AccountName: "mfa_user@example.com",
	})
	if err != nil {
		t.Fatalf("failed to generate totp key: %v", err)
	}

	hashBytes, _ := bcrypt.GenerateFromPassword([]byte("StrongPass123!"), bcrypt.DefaultCost)
	user := &domain.User{
		ID:           "user-mfa-1",
		TenantID:     tenantID,
		Email:        "mfa_user@example.com",
		Name:         "MFA User",
		PasswordHash: string(hashBytes),
		Role:         domain.RoleOwner,
		Status:       domain.UserStatusActive,
		MFAEnabled:   true,
		MFASecret:    totpKey.Secret(),
		CreatedAt:    now,
		UpdatedAt:    now,
	}
	_ = store.CreateUser(context.Background(), user)

	r := router.SetupRouter(store, pipe, workerPool, cfg)

	// Step 1: Login should return requires_mfa = true and mfa_token
	loginBody, _ := json.Marshal(map[string]string{
		"email":    "mfa_user@example.com",
		"password": "StrongPass123!",
	})
	reqLogin := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewReader(loginBody))
	reqLogin.Header.Set("Content-Type", "application/json")
	recLogin := httptest.NewRecorder()
	r.ServeHTTP(recLogin, reqLogin)

	if recLogin.Code != http.StatusOK {
		t.Fatalf("expected 200 on login with MFA, got %d", recLogin.Code)
	}

	var loginResp handlers.AuthResponse
	_ = json.Unmarshal(recLogin.Body.Bytes(), &loginResp)
	if !loginResp.RequiresMFA || loginResp.MFAToken == "" {
		t.Fatalf("expected requires_mfa=true and mfa_token, got %+v", loginResp)
	}

	// Step 2: Try invalid MFA code
	badVerifyBody, _ := json.Marshal(map[string]string{
		"mfa_token": loginResp.MFAToken,
		"code":      "000000",
	})
	reqBad := httptest.NewRequest(http.MethodPost, "/api/v1/auth/mfa/verify", bytes.NewReader(badVerifyBody))
	reqBad.Header.Set("Content-Type", "application/json")
	recBad := httptest.NewRecorder()
	r.ServeHTTP(recBad, reqBad)

	if recBad.Code != http.StatusUnauthorized {
		t.Errorf("expected 401 on bad MFA code, got %d", recBad.Code)
	}

	// Step 3: Validate with real TOTP code
	validCode, err := totp.GenerateCode(totpKey.Secret(), time.Now().UTC())
	if err != nil {
		t.Fatalf("failed to generate TOTP code: %v", err)
	}

	goodVerifyBody, _ := json.Marshal(map[string]string{
		"mfa_token": loginResp.MFAToken,
		"code":      validCode,
	})
	reqGood := httptest.NewRequest(http.MethodPost, "/api/v1/auth/mfa/verify", bytes.NewReader(goodVerifyBody))
	reqGood.Header.Set("Content-Type", "application/json")
	recGood := httptest.NewRecorder()
	r.ServeHTTP(recGood, reqGood)

	if recGood.Code != http.StatusOK {
		t.Fatalf("expected 200 on valid MFA code, got %d: %s", recGood.Code, recGood.Body.String())
	}

	var goodResp handlers.AuthResponse
	_ = json.Unmarshal(recGood.Body.Bytes(), &goodResp)
	if goodResp.Token == "" {
		t.Errorf("expected session token in MFA response, got empty")
	}

	claims, err := middleware.ValidateToken(cfg.JWTSecret, goodResp.Token)
	if err != nil || claims.UserID != user.ID {
		t.Errorf("invalid claims from MFA verified session token: %v", err)
	}
}

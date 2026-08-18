package test

import (
	"bytes"
	"context"
	"encoding/json"
	"mistake-backend/internal/config"
	"mistake-backend/internal/handlers"
	"mistake-backend/internal/pipeline"
	"mistake-backend/internal/router"
	"mistake-backend/internal/seed"
	"mistake-backend/internal/storage"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestFullHTTPAPIIntegration(t *testing.T) {
	cfg := config.LoadConfig()
	cfg.JWTSecret = "test-secret-key-123"

	store := storage.NewMemoryStore()
	pipe := pipeline.NewPipeline(store)
	workerPool := pipeline.NewWorkerPool(pipe, 2, 10)
	workerPool.Start()
	defer workerPool.Stop()

	// Seed tenant and users
	_, owner, err := seed.SeedDatabase(context.Background(), store)
	if err != nil {
		t.Fatalf("seed failed: %v", err)
	}

	router := router.SetupRouter(store, pipe, workerPool, cfg)

	// 1. Test Login
	loginBody, _ := json.Marshal(map[string]string{
		"email":    owner.Email,
		"password": "Admin@123456",
	})
	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewReader(loginBody))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("login failed with status %d: %s", rec.Code, rec.Body.String())
	}

	var authRes handlers.AuthResponse
	_ = json.Unmarshal(rec.Body.Bytes(), &authRes)
	token := authRes.Token
	if token == "" {
		t.Fatalf("expected JWT token, got empty")
	}

	// 2. Test Dashboard Summary
	reqDash := httptest.NewRequest(http.MethodGet, "/api/v1/dashboard/summary", nil)
	reqDash.Header.Set("Authorization", "Bearer "+token)
	recDash := httptest.NewRecorder()
	router.ServeHTTP(recDash, reqDash)

	if recDash.Code != http.StatusOK {
		t.Errorf("dashboard failed with %d: %s", recDash.Code, recDash.Body.String())
	}

	// 3. Test Cross-Tenant Security Mismatch
	reqCross := httptest.NewRequest(http.MethodGet, "/api/v1/dashboard/summary?tenant_id=foreign-tenant-xyz", nil)
	reqCross.Header.Set("Authorization", "Bearer "+token)
	recCross := httptest.NewRecorder()
	router.ServeHTTP(recCross, reqCross)

	if recCross.Code != http.StatusForbidden {
		t.Errorf("expected 403 for cross-tenant mismatch, got %d", recCross.Code)
	}

	// 4. Test Mistakes List
	reqMistakes := httptest.NewRequest(http.MethodGet, "/api/v1/mistakes", nil)
	reqMistakes.Header.Set("Authorization", "Bearer "+token)
	recMistakes := httptest.NewRecorder()
	router.ServeHTTP(recMistakes, reqMistakes)

	if recMistakes.Code != http.StatusOK {
		t.Errorf("mistakes list failed: %d", recMistakes.Code)
	}

	// 5. Test Mandatory Reason Logging on Dismiss
	reqDismissNoReason, _ := json.Marshal(map[string]string{
		"status": "dismissed",
		"reason": "",
	})
	reqDis := httptest.NewRequest(http.MethodPatch, "/api/v1/mistakes/mst-prc-po-tata-9001-inv-tata-3001/status", bytes.NewReader(reqDismissNoReason))
	reqDis.Header.Set("Authorization", "Bearer "+token)
	reqDis.Header.Set("Content-Type", "application/json")
	recDis := httptest.NewRecorder()
	router.ServeHTTP(recDis, reqDis)

	if recDis.Code != http.StatusBadRequest {
		t.Errorf("expected 400 Bad Request when dismissing without reason, got %d", recDis.Code)
	}

	// Dismiss WITH valid reason
	reqDismissWithReason, _ := json.Marshal(map[string]string{
		"status": "dismissed",
		"reason": "Supplier confirmed retrospective price amendment in contract addendum #4",
	})
	reqDis2 := httptest.NewRequest(http.MethodPatch, "/api/v1/mistakes/mst-prc-po-tata-9001-inv-tata-3001/status", bytes.NewReader(reqDismissWithReason))
	reqDis2.Header.Set("Authorization", "Bearer "+token)
	reqDis2.Header.Set("Content-Type", "application/json")
	recDis2 := httptest.NewRecorder()
	router.ServeHTTP(recDis2, reqDis2)

	if recDis2.Code != http.StatusOK {
		t.Errorf("expected 200 OK when dismissing with reason, got %d: %s", recDis2.Code, recDis2.Body.String())
	}

	// 6. Test Global Search
	reqSearch := httptest.NewRequest(http.MethodGet, "/api/v1/search?q=Tata", nil)
	reqSearch.Header.Set("Authorization", "Bearer "+token)
	recSearch := httptest.NewRecorder()
	router.ServeHTTP(recSearch, reqSearch)

	if recSearch.Code != http.StatusOK {
		t.Errorf("search failed with %d", recSearch.Code)
	}

	// 7. Test Billing Checkout
	chkBody, _ := json.Marshal(map[string]string{"plan_tier": "growth"})
	reqChk := httptest.NewRequest(http.MethodPost, "/api/v1/billing/checkout", bytes.NewReader(chkBody))
	reqChk.Header.Set("Authorization", "Bearer "+token)
	reqChk.Header.Set("Content-Type", "application/json")
	recChk := httptest.NewRecorder()
	router.ServeHTTP(recChk, reqChk)

	if recChk.Code != http.StatusOK {
		t.Errorf("billing checkout failed: %d", recChk.Code)
	}
}

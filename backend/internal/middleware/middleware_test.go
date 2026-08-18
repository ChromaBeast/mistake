package middleware

import (
	"context"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/rbac"
	"mistake-backend/internal/storage"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestMiddlewareStack(t *testing.T) {
	store := storage.NewMemoryStore()
	secret := "secret-jwt-key"

	user := &domain.User{
		ID: "u-mid-1", TenantID: "t-mid-1", Email: "mid@example.com",
		Role: domain.RoleViewer, Status: domain.UserStatusActive,
	}

	// 1. Auth middleware test
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	authMW := AuthMiddleware(secret, store)(handler)

	// No token -> 401
	reqNoAuth := httptest.NewRequest(http.MethodGet, "/test", nil)
	recNoAuth := httptest.NewRecorder()
	authMW.ServeHTTP(recNoAuth, reqNoAuth)
	if recNoAuth.Code != http.StatusUnauthorized {
		t.Errorf("expected 401 Unauthorized, got %d", recNoAuth.Code)
	}

	// 2. Permission check middleware: Viewer cannot manage users
	permMW := RequirePermission(rbac.PermUserInvite)(handler)
	ctx := context.WithValue(context.Background(), RoleKey, domain.RoleViewer)
	reqPerm := httptest.NewRequest(http.MethodPost, "/invite", nil).WithContext(ctx)
	recPerm := httptest.NewRecorder()
	permMW.ServeHTTP(recPerm, reqPerm)
	if recPerm.Code != http.StatusForbidden {
		t.Errorf("expected 403 Forbidden for Viewer role, got %d", recPerm.Code)
	}
	_ = user
}

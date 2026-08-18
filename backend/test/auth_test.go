package test

import (
	"context"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/middleware"
	"mistake-backend/internal/rbac"
	"mistake-backend/internal/storage"
	"testing"
	"time"
)

func TestAuthAndRBAC(t *testing.T) {
	store := storage.NewMemoryStore()
	ctx := context.Background()

	// 1. Create tenant and users
	tenant := &domain.Tenant{
		ID:        "tenant-test-1",
		Name:      "Test Enterprise",
		Status:    domain.TenantStatusActive,
		CreatedAt: time.Now().UTC(),
	}
	if err := store.CreateTenant(ctx, tenant); err != nil {
		t.Fatalf("failed to create tenant: %v", err)
	}

	owner := &domain.User{
		ID:        "user-owner",
		TenantID:  tenant.ID,
		Email:     "owner@example.com",
		Role:      domain.RoleOwner,
		Status:    domain.UserStatusActive,
		CreatedAt: time.Now().UTC(),
	}
	_ = store.CreateUser(ctx, owner)

	analyst := &domain.User{
		ID:        "user-analyst",
		TenantID:  tenant.ID,
		Email:     "analyst@example.com",
		Role:      domain.RoleAnalyst,
		Status:    domain.UserStatusActive,
		CreatedAt: time.Now().UTC(),
	}
	_ = store.CreateUser(ctx, analyst)

	viewer := &domain.User{
		ID:        "user-viewer",
		TenantID:  tenant.ID,
		Email:     "viewer@example.com",
		Role:      domain.RoleViewer,
		Status:    domain.UserStatusActive,
		CreatedAt: time.Now().UTC(),
	}
	_ = store.CreateUser(ctx, viewer)

	// 2. Test JWT Token Generation and Validation
	secret := "my-jwt-test-secret"
	token, err := middleware.GenerateToken(secret, owner, 1*time.Hour)
	if err != nil {
		t.Fatalf("failed to generate token: %v", err)
	}

	claims, err := middleware.ValidateToken(secret, token)
	if err != nil {
		t.Fatalf("failed to validate token: %v", err)
	}
	if claims.TenantID != tenant.ID || claims.Role != domain.RoleOwner {
		t.Errorf("token claims mismatch: %+v", claims)
	}

	// 3. Test RBAC permissions
	if !rbac.HasPermission(domain.RoleOwner, rbac.PermBillingManage) {
		t.Errorf("Owner must have PermBillingManage")
	}
	if rbac.HasPermission(domain.RoleAdmin, rbac.PermBillingManage) {
		t.Errorf("Admin must NOT have PermBillingManage")
	}
	if !rbac.HasPermission(domain.RoleAnalyst, rbac.PermMistakeAct) {
		t.Errorf("Analyst must have PermMistakeAct")
	}
	if rbac.HasPermission(domain.RoleViewer, rbac.PermMistakeAct) {
		t.Errorf("Viewer must NOT have PermMistakeAct")
	}
	if !rbac.HasPermission(domain.RoleViewer, rbac.PermMistakeView) {
		t.Errorf("Viewer must have PermMistakeView")
	}
}

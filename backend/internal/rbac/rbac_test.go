package rbac

import (
	"mistake-backend/internal/domain"
	"testing"
)

func TestRBACMatrix(t *testing.T) {
	if !IsValidRole(domain.RoleOwner) || !IsValidRole(domain.RoleViewer) {
		t.Errorf("expected roles to be valid")
	}
	if IsValidRole("SuperAdmin") {
		t.Errorf("SuperAdmin should not be a valid role")
	}

	role, err := RoleFromString("Manager")
	if err != nil || role != domain.RoleManager {
		t.Errorf("RoleFromString failed")
	}

	if RoleLevel(domain.RoleOwner) <= RoleLevel(domain.RoleAdmin) {
		t.Errorf("Owner must have higher level than Admin")
	}

	if !HasPermission(domain.RoleOwner, PermAccountDelete) {
		t.Errorf("Owner must have PermAccountDelete")
	}
	if HasPermission(domain.RoleManager, PermUserInvite) {
		t.Errorf("Manager must NOT have PermUserInvite")
	}
}

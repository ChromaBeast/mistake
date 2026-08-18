package rbac

import (
	"errors"
	"mistake-backend/internal/domain"
)

var (
	ErrInvalidRole     = errors.New("invalid role specified")
	ErrPermissionDenied = errors.New("permission denied for current role")
)

// AllRoles list all allowed roles in the system.
var AllRoles = []domain.UserRole{
	domain.RoleOwner,
	domain.RoleAdmin,
	domain.RoleManager,
	domain.RoleAnalyst,
	domain.RoleViewer,
}

// IsValidRole verifies if a given role string matches a defined role.
func IsValidRole(role domain.UserRole) bool {
	for _, r := range AllRoles {
		if r == role {
			return true
		}
	}
	return false
}

// RoleFromString converts a string to a typed UserRole.
func RoleFromString(s string) (domain.UserRole, error) {
	r := domain.UserRole(s)
	if IsValidRole(r) {
		return r, nil
	}
	return "", ErrInvalidRole
}

// RoleLevel returns numerical hierarchy level for comparisons.
func RoleLevel(r domain.UserRole) int {
	switch r {
	case domain.RoleOwner:
		return 50
	case domain.RoleAdmin:
		return 40
	case domain.RoleManager:
		return 30
	case domain.RoleAnalyst:
		return 20
	case domain.RoleViewer:
		return 10
	default:
		return 0
	}
}

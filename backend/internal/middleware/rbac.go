package middleware

import (
	"mistake-backend/internal/domain"
	"mistake-backend/internal/rbac"
	"net/http"
)

// RequirePermission checks whether the calling user role possesses the requested permission.
func RequirePermission(perm rbac.Permission) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role := GetUserRole(r.Context())
			if role == "" || !rbac.HasPermission(role, perm) {
				http.Error(w, `{"error":{"code":"FORBIDDEN","message":"Insufficient permissions for this operation"}}`, http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// RequireRole checks whether the calling user possesses at least one of the accepted roles.
func RequireRole(roles ...domain.UserRole) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userRole := GetUserRole(r.Context())
			for _, allowed := range roles {
				if userRole == allowed {
					next.ServeHTTP(w, r)
					return
				}
			}
			http.Error(w, `{"error":{"code":"FORBIDDEN","message":"Role not authorized for this endpoint"}}`, http.StatusForbidden)
		})
	}
}

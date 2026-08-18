package middleware

import (
	"context"
	"mistake-backend/internal/domain"
	"net/http"
)

// GetTenantID retrieves the authenticated tenant ID from context.
func GetTenantID(ctx context.Context) string {
	if val, ok := ctx.Value(TenantIDKey).(string); ok {
		return val
	}
	if val, ok := ctx.Value("tenant_id").(string); ok {
		return val
	}
	return ""
}

// GetUserID retrieves the authenticated user ID from context.
func GetUserID(ctx context.Context) string {
	if val, ok := ctx.Value(UserIDKey).(string); ok {
		return val
	}
	return ""
}

// GetUserRole retrieves the authenticated user's role from context.
func GetUserRole(ctx context.Context) domain.UserRole {
	if val, ok := ctx.Value(RoleKey).(domain.UserRole); ok {
		return val
	}
	return ""
}

// GetUserEmail retrieves the authenticated user's email from context.
func GetUserEmail(ctx context.Context) string {
	if val, ok := ctx.Value(EmailKey).(string); ok {
		return val
	}
	return ""
}

// TenantGuardMiddleware checks if client supplied a conflicting tenant_id query param.
func TenantGuardMiddleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenTenant := GetTenantID(r.Context())
			queryTenant := r.URL.Query().Get("tenant_id")
			if queryTenant != "" && tokenTenant != "" && queryTenant != tokenTenant {
				http.Error(w, `{"error":{"code":"TENANT_MISMATCH","message":"Requested tenant does not match authenticated session token"}}`, http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

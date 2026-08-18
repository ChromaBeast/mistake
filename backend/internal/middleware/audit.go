package middleware

import (
	"fmt"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
	"net/http"
	"time"
)

// AuditMiddleware records audit log entries for mutating operations (POST, PUT, PATCH, DELETE).
func AuditMiddleware(store storage.Store) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method == http.MethodGet || r.Method == http.MethodOptions || r.Method == http.MethodHead {
				next.ServeHTTP(w, r)
				return
			}

			next.ServeHTTP(w, r)

			tenantID := GetTenantID(r.Context())
			userID := GetUserID(r.Context())
			email := GetUserEmail(r.Context())

			if tenantID != "" {
				logEntry := &domain.AuditLog{
					ID:           fmt.Sprintf("audit-%d", time.Now().UnixNano()),
					TenantID:     tenantID,
					ActorUserID:  userID,
					ActorEmail:   email,
					Action:       r.Method + " " + r.URL.Path,
					ResourceType: "http_request",
					IPAddress:    r.RemoteAddr,
					CreatedAt:    time.Now().UTC(),
				}
				_ = store.CreateAuditLog(r.Context(), logEntry)
			}
		})
	}
}

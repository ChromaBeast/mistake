package middleware

import (
	"fmt"
	"log"
	"net/http"
)

// RecoverMiddleware intercepts panics and writes a standard error JSON response.
func RecoverMiddleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if rec := recover(); rec != nil {
					log.Printf("[PANIC RECOVERED] %v", rec)
					w.Header().Set("Content-Type", "application/json")
					w.WriteHeader(http.StatusInternalServerError)
					_, _ = fmt.Fprintf(w, `{"error":{"code":"INTERNAL_SERVER_ERROR","message":"An unexpected error occurred"}}`)
				}
			}()
			next.ServeHTTP(w, r)
		})
	}
}

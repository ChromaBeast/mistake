package middleware

import (
	"encoding/json"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
)

const rateLimitWindow = time.Minute

type rateLimitEntry struct {
	count       int
	windowStart time.Time
}

type rateLimiter struct {
	mu      sync.Mutex
	entries map[string]*rateLimitEntry
	limit   int
}

func newRateLimiter(limit int) *rateLimiter {
	rl := &rateLimiter{entries: make(map[string]*rateLimitEntry), limit: limit}
	go func() {
		ticker := time.NewTicker(rateLimitWindow)
		defer ticker.Stop()
		for range ticker.C {
			rl.prune()
		}
	}()
	return rl
}

func (rl *rateLimiter) prune() {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	for key, e := range rl.entries {
		if time.Since(e.windowStart) > 2*rateLimitWindow {
			delete(rl.entries, key)
		}
	}
}

func (rl *rateLimiter) allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	now := time.Now()
	e, ok := rl.entries[key]
	if !ok || now.Sub(e.windowStart) >= rateLimitWindow {
		rl.entries[key] = &rateLimitEntry{count: 1, windowStart: now}
		return true
	}
	e.count++
	return e.count <= rl.limit
}

// ClientIP resolves the caller IP, preferring the proxy chain header since
// the service is deployed behind a reverse proxy (Render).
func ClientIP(r *http.Request) string {
	if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
		if idx := strings.IndexByte(fwd, ','); idx > 0 {
			return strings.TrimSpace(fwd[:idx])
		}
		return strings.TrimSpace(fwd)
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

// RateLimit returns middleware that allows `limit` requests per client IP
// per minute and rejects excess with a standard error envelope.
func RateLimit(limit int) func(http.Handler) http.Handler {
	rl := newRateLimiter(limit)
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if !rl.allow(ClientIP(r)) {
				w.Header().Set("Content-Type", "application/json")
				w.Header().Set("Retry-After", "60")
				w.WriteHeader(http.StatusTooManyRequests)
				_ = json.NewEncoder(w).Encode(map[string]interface{}{
					"error": map[string]string{
						"code":    "RATE_LIMITED",
						"message": "Too many requests. Please wait before retrying.",
					},
				})
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

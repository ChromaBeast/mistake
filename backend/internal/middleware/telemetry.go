package middleware

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"time"
)

const (
	TraceIDKey   contextKey = "trace_id"
	SpanIDKey    contextKey = "span_id"
	RequestIDKey contextKey = "request_id"
)


// generateHexID creates random hex strings for tracing.
func generateHexID(bytes int) string {
	b := make([]byte, bytes)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

// OpenTelemetryMiddleware handles W3C Trace Context (traceparent) and request timing.
func OpenTelemetryMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		traceID := r.Header.Get("X-Trace-ID")
		if traceID == "" {
			traceID = generateHexID(16) // 128-bit hex trace ID
		}

		spanID := generateHexID(8) // 64-bit hex span ID
		reqID := r.Header.Get("X-Request-ID")
		if reqID == "" {
			reqID = fmt.Sprintf("req-%s", spanID)
		}

		ctx := context.WithValue(r.Context(), TraceIDKey, traceID)
		ctx = context.WithValue(ctx, SpanIDKey, spanID)
		ctx = context.WithValue(ctx, RequestIDKey, reqID)

		// Set W3C traceparent and correlation headers on response
		w.Header().Set("traceparent", fmt.Sprintf("00-%s-%s-01", traceID, spanID))
		w.Header().Set("X-Trace-ID", traceID)
		w.Header().Set("X-Request-ID", reqID)

		next.ServeHTTP(w, r.WithContext(ctx))

		_ = time.Since(start)
	})
}

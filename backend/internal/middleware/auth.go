package middleware

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
	"net/http"
	"strings"
	"time"
)

type Claims struct {
	TenantID string          `json:"tenant_id"`
	UserID   string          `json:"user_id"`
	Email    string          `json:"email"`
	Role     domain.UserRole `json:"role"`
	Exp      int64           `json:"exp"`
}

type contextKey string

const (
	TenantIDKey contextKey = "tenant_id"
	UserIDKey   contextKey = "user_id"
	RoleKey     contextKey = "role"
	EmailKey    contextKey = "email"
)

func GenerateToken(secret string, user *domain.User, duration time.Duration) (string, error) {
	claims := Claims{
		TenantID: user.TenantID,
		UserID:   user.ID,
		Email:    user.Email,
		Role:     user.Role,
		Exp:      time.Now().Add(duration).Unix(),
	}
	payloadBytes, _ := json.Marshal(claims)
	header := base64.RawURLEncoding.EncodeToString([]byte(`{"alg":"HS256","typ":"JWT"}`))
	payload := base64.RawURLEncoding.EncodeToString(payloadBytes)
	unsigned := header + "." + payload

	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(unsigned))
	sig := base64.RawURLEncoding.EncodeToString(h.Sum(nil))

	return unsigned + "." + sig, nil
}

func ValidateToken(secret, tokenStr string) (*Claims, error) {
	parts := strings.Split(tokenStr, ".")
	if len(parts) != 3 {
		return nil, errors.New("invalid token format")
	}
	unsigned := parts[0] + "." + parts[1]
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(unsigned))
	expectedSig := base64.RawURLEncoding.EncodeToString(h.Sum(nil))

	if !hmac.Equal([]byte(parts[2]), []byte(expectedSig)) {
		return nil, errors.New("invalid token signature")
	}

	payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, err
	}
	var claims Claims
	if err := json.Unmarshal(payloadBytes, &claims); err != nil {
		return nil, err
	}
	if time.Now().Unix() > claims.Exp {
		return nil, errors.New("token expired")
	}
	return &claims, nil
}

func AuthMiddleware(secret string, store storage.Store) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
				http.Error(w, `{"error":{"code":"UNAUTHORIZED","message":"Missing or invalid authorization header"}}`, http.StatusUnauthorized)
				return
			}
			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

			// Validate JWT or check session token
			claims, err := ValidateToken(secret, tokenStr)
			if err != nil {
				// Fallback check store session
				sess, sErr := store.GetSession(r.Context(), tokenStr)
				if sErr != nil {
					http.Error(w, fmt.Sprintf(`{"error":{"code":"UNAUTHORIZED","message":"%s"}}`, err.Error()), http.StatusUnauthorized)
					return
				}
				user, uErr := store.GetUserByID(r.Context(), sess.TenantID, sess.UserID)
				if uErr != nil || user.Status == domain.UserStatusDisabled {
					http.Error(w, `{"error":{"code":"UNAUTHORIZED","message":"User disabled or not found"}}`, http.StatusUnauthorized)
					return
				}
				claims = &Claims{TenantID: sess.TenantID, UserID: sess.UserID, Email: user.Email, Role: user.Role}
			}

			ctx := context.WithValue(r.Context(), TenantIDKey, claims.TenantID)
			ctx = context.WithValue(ctx, UserIDKey, claims.UserID)
			ctx = context.WithValue(ctx, RoleKey, claims.Role)
			ctx = context.WithValue(ctx, EmailKey, claims.Email)
			ctx = context.WithValue(ctx, "tenant_id", claims.TenantID) // For storage layer

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

package harness

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
	"time"
)

// SessionContext encapsulates an authenticated session.
type SessionContext struct {
	Client   *Client
	TenantID string
	UserID   string
	Email    string
	Role     string
	Token    string
}

// CreateTenantAndOwner registers a new tenant with an Owner user and returns the session.
func CreateTenantAndOwner(t *testing.T, baseURL, prefix string) *SessionContext {
	t.Helper()
	client := NewClient(baseURL)
	uniqueSuffix := fmt.Sprintf("%d", time.Now().UnixNano())
	tenantName := fmt.Sprintf("%s-Tenant-%s", prefix, uniqueSuffix[len(uniqueSuffix)-6:])
	email := fmt.Sprintf("%s_%s@example.com", prefix, uniqueSuffix[len(uniqueSuffix)-6:])
	password := "SecurePass123!"

	signupReq := map[string]any{
		"tenant_name": tenantName,
		"name":        "Owner " + prefix,
		"email":       email,
		"password":    password,
	}

	resp, err := client.Post("/auth/signup", signupReq)
	if err != nil {
		t.Fatalf("failed to signup owner: %v", err)
	}
	AssertStatusCode(t, resp, http.StatusCreated)

	var authResp AuthResponse
	dataBytes, _ := json.Marshal(resp.Data)
	if err := json.Unmarshal(dataBytes, &authResp); err != nil {
		t.Fatalf("failed to decode signup auth response: %v", err)
	}

	client.SetToken(authResp.Token)
	client.TenantID = authResp.Tenant.ID

	return &SessionContext{
		Client:   client,
		TenantID: authResp.Tenant.ID,
		UserID:   authResp.User.ID,
		Email:    email,
		Role:     "Owner",
		Token:    authResp.Token,
	}
}

// InviteAndCreateUser invites a user with a given role and returns their SessionContext.
func InviteAndCreateUser(t *testing.T, ownerCtx *SessionContext, role string) *SessionContext {
	t.Helper()
	uniqueSuffix := fmt.Sprintf("%d", time.Now().UnixNano())
	userEmail := fmt.Sprintf("user_%s_%s@example.com", role, uniqueSuffix[len(uniqueSuffix)-6:])
	userName := fmt.Sprintf("Test %s", role)

	inviteReq := map[string]any{
		"email": userEmail,
		"name":  userName,
		"role":  role,
	}

	resp, err := ownerCtx.Client.Post("/users/invite", inviteReq)
	if err != nil {
		t.Fatalf("failed to invite user %s: %v", role, err)
	}
	AssertStatusCode(t, resp, http.StatusCreated)

	userClient := NewClient(ownerCtx.Client.BaseURL)
	loginReq := map[string]any{
		"email":    userEmail,
		"password": "Password123!",
	}
	loginResp, err := userClient.Post("/auth/login", loginReq)
	if err != nil {
		t.Fatalf("failed to login invited user %s: %v", role, err)
	}
	AssertStatusCode(t, loginResp, http.StatusOK)

	var authResp AuthResponse
	dataBytes, _ := json.Marshal(loginResp.Data)
	_ = json.Unmarshal(dataBytes, &authResp)

	userClient.SetToken(authResp.Token)
	userClient.TenantID = ownerCtx.TenantID

	return &SessionContext{
		Client:   userClient,
		TenantID: ownerCtx.TenantID,
		UserID:   authResp.User.ID,
		Email:    userEmail,
		Role:     role,
		Token:    authResp.Token,
	}
}

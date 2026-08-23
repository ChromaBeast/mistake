package router

import (
	"mistake-backend/internal/config"
	"mistake-backend/internal/handlers"
	"mistake-backend/internal/middleware"
	"mistake-backend/internal/pipeline"
	"mistake-backend/internal/rbac"
	"mistake-backend/internal/storage"
	"net/http"
)

func SetupRouter(store storage.Store, p *pipeline.Pipeline, wp *pipeline.WorkerPool, cfg *config.Config) http.Handler {
	mux := http.NewServeMux()

	authH := handlers.NewAuthHandler(store, cfg.JWTSecret)
	sessionH := handlers.NewSessionHandler(store)
	tenantH := handlers.NewTenantHandler(store)
	dsH := handlers.NewDataSourceHandler(store, p, wp)
	entityH := handlers.NewEntityHandler(store)
	eventH := handlers.NewEventHandler(store)
	mistakeH := handlers.NewMistakeHandler(store)
	mistakeTransH := handlers.NewMistakeTransitionHandler(store)
	searchH := handlers.NewSearchHandler(store)
	notifH := handlers.NewNotificationHandler(store)
	auditH := handlers.NewAuditHandler(store)
	retentionH := handlers.NewRetentionHandler(store)
	billingH := handlers.NewBillingHandler(store, cfg)
	feedbackH := handlers.NewFeedbackHandler(store)
	analyticsH := handlers.NewAnalyticsHandler(store)
	pilotAgreementH := handlers.NewPilotAgreementHandler(store)

	// Health check
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		handlers.RespondJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "mistake-backend"})
	})

	// Public Auth endpoints — rate limited per client IP to blunt credential
	// stuffing and token-guessing (login/MFA stricter than signup/refresh).
	authLimiter := middleware.RateLimit(10)
	tokenLimiter := middleware.RateLimit(60)
	mux.Handle("POST /api/v1/auth/signup", authLimiter(http.HandlerFunc(authH.Signup)))
	mux.Handle("POST /api/v1/auth/login", authLimiter(http.HandlerFunc(authH.Login)))
	mux.Handle("POST /api/v1/auth/mfa/verify", authLimiter(http.HandlerFunc(authH.MFAVerify)))
	mux.Handle("POST /api/v1/auth/refresh", tokenLimiter(http.HandlerFunc(authH.RefreshToken)))
	mux.Handle("POST /api/v1/auth/logout", tokenLimiter(http.HandlerFunc(authH.Logout)))

	// Protected API Router
	authMiddleware := middleware.AuthMiddleware(cfg.JWTSecret, store)
	tenantGuard := middleware.TenantGuardMiddleware()
	auditMiddleware := middleware.AuditMiddleware(store)

	wrap := func(h http.HandlerFunc) http.Handler {
		return authMiddleware(tenantGuard(auditMiddleware(h)))
	}

	wrapWithPerm := func(perm rbac.Permission, h http.HandlerFunc) http.Handler {
		return authMiddleware(tenantGuard(auditMiddleware(middleware.RequirePermission(perm)(http.HandlerFunc(h)))))
	}

	// Auth sessions & profile
	mux.Handle("GET /api/v1/auth/me", wrap(authH.GetMe))
	mux.Handle("GET /api/v1/auth/sessions", wrap(sessionH.ListSessions))
	mux.Handle("DELETE /api/v1/auth/sessions/{id}", wrap(sessionH.RevokeSession))

	// Tenant & Users
	mux.Handle("GET /api/v1/tenant", wrap(tenantH.GetTenant))
	mux.Handle("PATCH /api/v1/tenant", wrapWithPerm(rbac.PermTenantWrite, tenantH.UpdateTenant))
	mux.Handle("GET /api/v1/users", wrap(tenantH.ListUsers))
	mux.Handle("POST /api/v1/users/invite", wrapWithPerm(rbac.PermUserInvite, tenantH.InviteUser))
	mux.Handle("PATCH /api/v1/users/{id}/role", wrapWithPerm(rbac.PermUserRoleUpdate, tenantH.UpdateUserRole))
	mux.Handle("PATCH /api/v1/users/{id}/status", wrapWithPerm(rbac.PermUserStatusUpdate, tenantH.UpdateUserStatus))

	// Data sources & Documents
	mux.Handle("POST /api/v1/data-sources", wrap(dsH.Create))
	mux.Handle("GET /api/v1/data-sources", wrap(dsH.List))
	mux.Handle("GET /api/v1/data-sources/{id}", wrap(dsH.Get))
	mux.Handle("GET /api/v1/documents/{id}", wrap(dsH.GetDocument))
	mux.Handle("GET /api/v1/documents/{id}/evidence", wrap(dsH.GetDocumentEvidence))

	// Entities
	mux.Handle("GET /api/v1/entities", wrap(entityH.List))
	mux.Handle("GET /api/v1/entities/review-queue", wrap(entityH.ListReviewQueue))
	mux.Handle("GET /api/v1/entities/{id}", wrap(entityH.Get))
	mux.Handle("POST /api/v1/entities/{id}/merge", wrap(entityH.ConfirmMerge))
	mux.Handle("POST /api/v1/entities/{id}/reject-merge", wrap(entityH.RejectMerge))
	mux.Handle("GET /api/v1/entities/{id}/timeline", wrap(eventH.GetEntityTimeline))

	// Events
	mux.Handle("GET /api/v1/events", wrap(eventH.List))

	// Mistakes & Dashboard
	mux.Handle("GET /api/v1/dashboard/summary", wrap(mistakeH.GetDashboardSummary))
	mux.Handle("GET /api/v1/mistakes", wrap(mistakeH.List))
	mux.Handle("GET /api/v1/mistakes/{id}", wrap(mistakeH.Get))
	mux.Handle("PATCH /api/v1/mistakes/{id}/status", wrap(mistakeTransH.UpdateStatus))
	mux.Handle("PATCH /api/v1/mistakes/{id}/assign", wrap(mistakeTransH.Assign))
	mux.Handle("GET /api/v1/mistakes/{id}/transitions", wrap(mistakeTransH.ListTransitions))

	// Search & Notifications
	mux.Handle("GET /api/v1/search", wrap(searchH.Search))
	mux.Handle("GET /api/v1/notifications", wrap(notifH.List))
	mux.Handle("PATCH /api/v1/notifications/{id}/read", wrap(notifH.MarkRead))

	// Audit & Retention
	mux.Handle("GET /api/v1/audit-logs", wrap(auditH.List))
	mux.Handle("GET /api/v1/retention-policy", wrap(retentionH.Get))
	mux.Handle("PATCH /api/v1/retention-policy", wrap(retentionH.Update))

	// Billing
	mux.Handle("GET /api/v1/billing/subscription", wrap(billingH.GetSubscription))
	mux.Handle("POST /api/v1/billing/checkout", wrap(billingH.Checkout))
	mux.Handle("GET /api/v1/billing/invoices", wrap(billingH.ListInvoices))

	// Pilot Enablers: Feedback, Telemetry, and Agreement
	mux.Handle("POST /api/v1/mistakes/{id}/feedback", wrap(feedbackH.SubmitFeedback))
	mux.Handle("GET /api/v1/mistakes/{id}/feedback", wrap(feedbackH.GetMistakeFeedback))
	mux.Handle("GET /api/v1/analytics/accuracy-metrics", wrap(feedbackH.GetMetrics))
	mux.Handle("POST /api/v1/analytics/events", wrap(analyticsH.RecordEvent))
	mux.Handle("GET /api/v1/analytics/aha-summary", wrap(analyticsH.GetAhaSummary))
	mux.Handle("GET /api/v1/tenant/pilot-agreement", wrap(pilotAgreementH.GetStatus))
	mux.Handle("POST /api/v1/tenant/pilot-agreement/accept", wrap(pilotAgreementH.AcceptAgreement))

	// Top-level CORS and panic recovery
	corsMiddleware := middleware.CORSMiddleware(cfg.AllowedOrigins)
	recoverMiddleware := middleware.RecoverMiddleware()

	return recoverMiddleware(corsMiddleware(mux))
}

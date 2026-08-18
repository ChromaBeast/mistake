package storage

import (
	"context"
	"errors"
	"strings"
	"time"

	"mistake-backend/internal/domain"

	"github.com/jackc/pgx/v5"
)

func (s *PostgresStore) GetSubscription(ctx context.Context, tenantID string) (*domain.Subscription, error) {
	q := `SELECT id, tenant_id, plan_tier, plan_name, amount_minor, currency, status, current_period_start, current_period_end, cancel_at_period_end, usage_document_count, max_documents FROM subscriptions WHERE tenant_id=$1`
	var sub domain.Subscription
	err := s.pool.QueryRow(ctx, q, tenantID).Scan(&sub.ID, &sub.TenantID, &sub.PlanTier, &sub.PlanName, &sub.AmountMinor, &sub.Currency, &sub.Status, &sub.CurrentPeriodStart, &sub.CurrentPeriodEnd, &sub.CancelAtPeriodEnd, &sub.UsageDocumentCount, &sub.MaxDocuments)
	if errors.Is(err, pgx.ErrNoRows) {
		now := time.Now().UTC()
		return &domain.Subscription{
			ID: "sub-trial-" + tenantID, TenantID: tenantID, PlanTier: domain.PlanTierTrial,
			PlanName: "Free Trial", AmountMinor: 0, Currency: "INR", Status: domain.SubStatusTrialing,
			CurrentPeriodStart: now, CurrentPeriodEnd: now.AddDate(0, 0, 14),
			UsageDocumentCount: 0, MaxDocuments: 100,
		}, nil
	}
	return &sub, err
}

func (s *PostgresStore) UpdateSubscription(ctx context.Context, sub *domain.Subscription) error {
	q := `INSERT INTO subscriptions (id, tenant_id, plan_tier, plan_name, amount_minor, currency, status, current_period_start, current_period_end, cancel_at_period_end, usage_document_count, max_documents)
	      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	      ON CONFLICT (tenant_id) DO UPDATE SET plan_tier=$3, plan_name=$4, amount_minor=$5, currency=$6, status=$7, current_period_start=$8, current_period_end=$9, cancel_at_period_end=$10, usage_document_count=$11, max_documents=$12`
	_, err := s.pool.Exec(ctx, q, sub.ID, sub.TenantID, sub.PlanTier, sub.PlanName, sub.AmountMinor, sub.Currency, sub.Status, sub.CurrentPeriodStart, sub.CurrentPeriodEnd, sub.CancelAtPeriodEnd, sub.UsageDocumentCount, sub.MaxDocuments)
	return err
}

func (s *PostgresStore) CreateBillingInvoice(ctx context.Context, inv *domain.BillingInvoice) error {
	q := `INSERT INTO billing_invoices (id, tenant_id, invoice_no, amount_minor, currency, status, period_start, period_end, pdf_url, created_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
	_, err := s.pool.Exec(ctx, q, inv.ID, inv.TenantID, inv.InvoiceNo, inv.AmountMinor, inv.Currency, inv.Status, inv.PeriodStart, inv.PeriodEnd, inv.PDFURL, inv.CreatedAt)
	return err
}

func (s *PostgresStore) ListBillingInvoices(ctx context.Context, tenantID string) ([]*domain.BillingInvoice, error) {
	q := `SELECT id, tenant_id, invoice_no, amount_minor, currency, status, period_start, period_end, pdf_url, created_at FROM billing_invoices WHERE tenant_id=$1 ORDER BY created_at DESC`
	rows, err := s.pool.Query(ctx, q, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.BillingInvoice
	for rows.Next() {
		var inv domain.BillingInvoice
		if err := rows.Scan(&inv.ID, &inv.TenantID, &inv.InvoiceNo, &inv.AmountMinor, &inv.Currency, &inv.Status, &inv.PeriodStart, &inv.PeriodEnd, &inv.PDFURL, &inv.CreatedAt); err != nil {
			return nil, err
		}
		res = append(res, &inv)
	}
	return res, nil
}

func (s *PostgresStore) CreateNotification(ctx context.Context, n *domain.Notification) error {
	q := `INSERT INTO notifications (id, tenant_id, user_id, type, title, message, resource, is_read, created_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	_, err := s.pool.Exec(ctx, q, n.ID, n.TenantID, n.UserID, n.Type, n.Title, n.Message, n.Resource, n.Read, n.CreatedAt)
	return err
}

func (s *PostgresStore) ListNotifications(ctx context.Context, tenantID, userID string) ([]*domain.Notification, error) {
	q := `SELECT id, tenant_id, user_id, type, title, message, resource, is_read, created_at FROM notifications WHERE tenant_id=$1 AND user_id=$2 ORDER BY created_at DESC`
	rows, err := s.pool.Query(ctx, q, tenantID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.Notification
	for rows.Next() {
		var n domain.Notification
		if err := rows.Scan(&n.ID, &n.TenantID, &n.UserID, &n.Type, &n.Title, &n.Message, &n.Resource, &n.Read, &n.CreatedAt); err != nil {
			return nil, err
		}
		res = append(res, &n)
	}
	return res, nil
}

func (s *PostgresStore) MarkNotificationRead(ctx context.Context, tenantID, id string) error {
	q := `UPDATE notifications SET is_read=TRUE WHERE tenant_id=$1 AND id=$2`
	_, err := s.pool.Exec(ctx, q, tenantID, id)
	return err
}

func (s *PostgresStore) GlobalSearch(ctx context.Context, tenantID, query, entityType string) ([]*SearchResult, error) {
	q := `SELECT id, 'entity' as type, canonical_name as title, COALESCE(gstin, '') as subtitle, '' as snippet, id as reference_id
	      FROM entities WHERE tenant_id=$1 AND LOWER(canonical_name) LIKE LOWER($2)
	      UNION ALL
	      SELECT id, 'mistake' as type, explanation as title, severity as subtitle, mistake_type as snippet, id as reference_id
	      FROM mistakes WHERE tenant_id=$1 AND LOWER(explanation) LIKE LOWER($2)`
	pattern := "%" + strings.TrimSpace(query) + "%"
	rows, err := s.pool.Query(ctx, q, tenantID, pattern)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*SearchResult
	for rows.Next() {
		var sr SearchResult
		if err := rows.Scan(&sr.ID, &sr.Type, &sr.Title, &sr.Subtitle, &sr.Snippet, &sr.ReferenceID); err != nil {
			return nil, err
		}
		res = append(res, &sr)
	}
	return res, nil
}

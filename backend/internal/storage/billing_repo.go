package storage

import (
	"context"
	"fmt"
	"mistake-backend/internal/domain"
	"strings"
	"time"
)

func (s *MemoryStore) GetSubscription(ctx context.Context, tenantID string) (*domain.Subscription, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	sub, ok := s.subscriptions[tenantID]
	if !ok {
		return &domain.Subscription{
			ID: "sub-trial-" + tenantID, TenantID: tenantID, PlanTier: domain.PlanTierTrial,
			PlanName: "Free Trial", AmountMinor: 0, Currency: "INR", Status: domain.SubStatusTrialing,
			CurrentPeriodStart: time.Now().UTC(), CurrentPeriodEnd: time.Now().UTC().AddDate(0, 0, 14),
			UsageDocumentCount: 0, MaxDocuments: 100,
		}, nil
	}
	cp := *sub
	return &cp, nil
}

func (s *MemoryStore) UpdateSubscription(ctx context.Context, sub *domain.Subscription) error {
	if err := verifyTenant(ctx, sub.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.subscriptions[sub.TenantID] = sub
	return nil
}

func (s *MemoryStore) CreateBillingInvoice(ctx context.Context, inv *domain.BillingInvoice) error {
	if err := verifyTenant(ctx, inv.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.billingInvoices[inv.TenantID] = append(s.billingInvoices[inv.TenantID], inv)
	return nil
}

func (s *MemoryStore) ListBillingInvoices(ctx context.Context, tenantID string) ([]*domain.BillingInvoice, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.billingInvoices[tenantID], nil
}

func (s *MemoryStore) CreateNotification(ctx context.Context, n *domain.Notification) error {
	if err := verifyTenant(ctx, n.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	key := n.TenantID + ":" + n.UserID
	s.notifications[key] = append(s.notifications[key], n)
	return nil
}

func (s *MemoryStore) ListNotifications(ctx context.Context, tenantID, userID string) ([]*domain.Notification, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	key := tenantID + ":" + userID
	return s.notifications[key], nil
}

func (s *MemoryStore) MarkNotificationRead(ctx context.Context, tenantID, id string) error {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, notifs := range s.notifications {
		for _, n := range notifs {
			if n.TenantID == tenantID && n.ID == id {
				n.Read = true
				return nil
			}
		}
	}
	return ErrNotFound
}

func (s *MemoryStore) GlobalSearch(ctx context.Context, tenantID, query, filterType string) ([]*SearchResult, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	q := strings.ToLower(query)
	var results []*SearchResult

	if filterType == "" || filterType == "entity" || filterType == "supplier" || filterType == "customer" {
		for _, e := range s.entities {
			if e.TenantID == tenantID && strings.Contains(strings.ToLower(e.CanonicalName), q) {
				results = append(results, &SearchResult{
					ID: e.ID, Type: string(e.EntityType), Title: e.CanonicalName,
					Subtitle: fmt.Sprintf("GSTIN: %s", e.GSTIN), Snippet: fmt.Sprintf("Status: %s", e.Status),
				})
			}
		}
	}
	if filterType == "" || filterType == "order" {
		for _, o := range s.orders {
			if o.TenantID == tenantID && (strings.Contains(strings.ToLower(o.OrderNumber), q) || strings.Contains(strings.ToLower(o.CustomerName), q)) {
				results = append(results, &SearchResult{
					ID: o.ID, Type: "order", Title: fmt.Sprintf("Order #%s", o.OrderNumber),
					Subtitle: o.CustomerName, Snippet: fmt.Sprintf("Status: %s, Amount: ₹%.2f", o.Status, float64(o.TotalAmountMinor)/100.0),
				})
			}
		}
	}
	if filterType == "" || filterType == "mistake" {
		for _, m := range s.mistakes {
			if m.TenantID == tenantID && (strings.Contains(strings.ToLower(m.Explanation), q) || strings.Contains(strings.ToLower(m.ReferenceNumber), q)) {
				results = append(results, &SearchResult{
					ID: m.ID, Type: "mistake", Title: fmt.Sprintf("%s (%s)", m.MistakeType, m.Severity),
					Subtitle: m.Explanation, Snippet: fmt.Sprintf("Impact: ₹%.2f", float64(m.FinancialImpactMinor)/100.0),
				})
			}
		}
	}
	return results, nil
}

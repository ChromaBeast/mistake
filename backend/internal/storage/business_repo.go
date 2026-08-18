package storage

import (
	"context"
	"mistake-backend/internal/domain"
)

func (s *MemoryStore) CreateOrder(ctx context.Context, o *domain.Order) error {
	if err := verifyTenant(ctx, o.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.orders[o.ID] = o
	return nil
}

func (s *MemoryStore) GetOrder(ctx context.Context, tenantID, id string) (*domain.Order, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	o, ok := s.orders[id]
	if !ok || o.TenantID != tenantID {
		return nil, ErrNotFound
	}
	cp := *o
	return &cp, nil
}

func (s *MemoryStore) ListOrders(ctx context.Context, tenantID string) ([]*domain.Order, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*domain.Order
	for _, o := range s.orders {
		if o.TenantID == tenantID {
			res = append(res, o)
		}
	}
	return res, nil
}

func (s *MemoryStore) CreatePurchaseOrder(ctx context.Context, po *domain.PurchaseOrder) error {
	if err := verifyTenant(ctx, po.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.purchaseOrders[po.ID] = po
	return nil
}

func (s *MemoryStore) GetPurchaseOrder(ctx context.Context, tenantID, id string) (*domain.PurchaseOrder, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	po, ok := s.purchaseOrders[id]
	if !ok || po.TenantID != tenantID {
		return nil, ErrNotFound
	}
	cp := *po
	return &cp, nil
}

func (s *MemoryStore) ListPurchaseOrders(ctx context.Context, tenantID string) ([]*domain.PurchaseOrder, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*domain.PurchaseOrder
	for _, po := range s.purchaseOrders {
		if po.TenantID == tenantID {
			res = append(res, po)
		}
	}
	return res, nil
}

func (s *MemoryStore) CreateInvoice(ctx context.Context, inv *domain.Invoice) error {
	if err := verifyTenant(ctx, inv.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.invoices[inv.ID] = inv
	return nil
}

func (s *MemoryStore) GetInvoice(ctx context.Context, tenantID, id string) (*domain.Invoice, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	inv, ok := s.invoices[id]
	if !ok || inv.TenantID != tenantID {
		return nil, ErrNotFound
	}
	cp := *inv
	return &cp, nil
}

func (s *MemoryStore) ListInvoices(ctx context.Context, tenantID string) ([]*domain.Invoice, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*domain.Invoice
	for _, inv := range s.invoices {
		if inv.TenantID == tenantID {
			res = append(res, inv)
		}
	}
	return res, nil
}

func (s *MemoryStore) CreatePayment(ctx context.Context, p *domain.Payment) error {
	if err := verifyTenant(ctx, p.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.payments[p.ID] = p
	return nil
}

func (s *MemoryStore) ListPayments(ctx context.Context, tenantID string) ([]*domain.Payment, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*domain.Payment
	for _, p := range s.payments {
		if p.TenantID == tenantID {
			res = append(res, p)
		}
	}
	return res, nil
}

func (s *MemoryStore) CreateShipment(ctx context.Context, sh *domain.Shipment) error {
	if err := verifyTenant(ctx, sh.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.shipments[sh.ID] = sh
	return nil
}

func (s *MemoryStore) ListShipments(ctx context.Context, tenantID string) ([]*domain.Shipment, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*domain.Shipment
	for _, sh := range s.shipments {
		if sh.TenantID == tenantID {
			res = append(res, sh)
		}
	}
	return res, nil
}

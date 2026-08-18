package storage

import (
	"context"
	"encoding/json"
	"errors"

	"mistake-backend/internal/domain"

	"github.com/jackc/pgx/v5"
)

func (s *PostgresStore) CreateOrder(ctx context.Context, o *domain.Order) error {
	linesJSON, _ := json.Marshal(o.Lines)
	q := `INSERT INTO orders (id, tenant_id, customer_id, customer_name, order_number, status, currency, total_amount_minor, occurred_at, observed_at, source_evidence_id, lines_json, created_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
	      ON CONFLICT (id) DO UPDATE SET status=$6, total_amount_minor=$8, lines_json=$12`
	_, err := s.pool.Exec(ctx, q, o.ID, o.TenantID, o.CustomerID, o.CustomerName, o.OrderNumber, o.Status, o.Currency, o.TotalAmountMinor, o.OccurredAt, o.ObservedAt, o.SourceEvidenceID, linesJSON, o.CreatedAt)
	return err
}

func (s *PostgresStore) GetOrder(ctx context.Context, tenantID, id string) (*domain.Order, error) {
	q := `SELECT id, tenant_id, customer_id, customer_name, order_number, status, currency, total_amount_minor, occurred_at, observed_at, source_evidence_id, lines_json, created_at
	      FROM orders WHERE tenant_id=$1 AND id=$2`
	var o domain.Order
	var linesJSON []byte
	err := s.pool.QueryRow(ctx, q, tenantID, id).Scan(&o.ID, &o.TenantID, &o.CustomerID, &o.CustomerName, &o.OrderNumber, &o.Status, &o.Currency, &o.TotalAmountMinor, &o.OccurredAt, &o.ObservedAt, &o.SourceEvidenceID, &linesJSON, &o.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if len(linesJSON) > 0 {
		_ = json.Unmarshal(linesJSON, &o.Lines)
	}
	return &o, err
}

func (s *PostgresStore) ListOrders(ctx context.Context, tenantID string) ([]*domain.Order, error) {
	q := `SELECT id, tenant_id, customer_id, customer_name, order_number, status, currency, total_amount_minor, occurred_at, observed_at, source_evidence_id, lines_json, created_at
	      FROM orders WHERE tenant_id=$1 ORDER BY created_at DESC`
	rows, err := s.pool.Query(ctx, q, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.Order
	for rows.Next() {
		var o domain.Order
		var linesJSON []byte
		if err := rows.Scan(&o.ID, &o.TenantID, &o.CustomerID, &o.CustomerName, &o.OrderNumber, &o.Status, &o.Currency, &o.TotalAmountMinor, &o.OccurredAt, &o.ObservedAt, &o.SourceEvidenceID, &linesJSON, &o.CreatedAt); err != nil {
			return nil, err
		}
		if len(linesJSON) > 0 {
			_ = json.Unmarshal(linesJSON, &o.Lines)
		}
		res = append(res, &o)
	}
	return res, nil
}

func (s *PostgresStore) CreatePurchaseOrder(ctx context.Context, po *domain.PurchaseOrder) error {
	linesJSON, _ := json.Marshal(po.Lines)
	q := `INSERT INTO purchase_orders (id, tenant_id, supplier_id, supplier_name, po_number, status, currency, total_amount_minor, occurred_at, observed_at, source_evidence_id, lines_json, created_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
	      ON CONFLICT (id) DO UPDATE SET status=$6, total_amount_minor=$8, lines_json=$12`
	_, err := s.pool.Exec(ctx, q, po.ID, po.TenantID, po.SupplierID, po.SupplierName, po.PONumber, po.Status, po.Currency, po.TotalAmountMinor, po.OccurredAt, po.ObservedAt, po.SourceEvidenceID, linesJSON, po.CreatedAt)
	return err
}

func (s *PostgresStore) GetPurchaseOrder(ctx context.Context, tenantID, id string) (*domain.PurchaseOrder, error) {
	q := `SELECT id, tenant_id, supplier_id, supplier_name, po_number, status, currency, total_amount_minor, occurred_at, observed_at, source_evidence_id, lines_json, created_at
	      FROM purchase_orders WHERE tenant_id=$1 AND id=$2`
	var po domain.PurchaseOrder
	var linesJSON []byte
	err := s.pool.QueryRow(ctx, q, tenantID, id).Scan(&po.ID, &po.TenantID, &po.SupplierID, &po.SupplierName, &po.PONumber, &po.Status, &po.Currency, &po.TotalAmountMinor, &po.OccurredAt, &po.ObservedAt, &po.SourceEvidenceID, &linesJSON, &po.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if len(linesJSON) > 0 {
		_ = json.Unmarshal(linesJSON, &po.Lines)
	}
	return &po, err
}

func (s *PostgresStore) ListPurchaseOrders(ctx context.Context, tenantID string) ([]*domain.PurchaseOrder, error) {
	q := `SELECT id, tenant_id, supplier_id, supplier_name, po_number, status, currency, total_amount_minor, occurred_at, observed_at, source_evidence_id, lines_json, created_at
	      FROM purchase_orders WHERE tenant_id=$1 ORDER BY created_at DESC`
	rows, err := s.pool.Query(ctx, q, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.PurchaseOrder
	for rows.Next() {
		var po domain.PurchaseOrder
		var linesJSON []byte
		if err := rows.Scan(&po.ID, &po.TenantID, &po.SupplierID, &po.SupplierName, &po.PONumber, &po.Status, &po.Currency, &po.TotalAmountMinor, &po.OccurredAt, &po.ObservedAt, &po.SourceEvidenceID, &linesJSON, &po.CreatedAt); err != nil {
			return nil, err
		}
		if len(linesJSON) > 0 {
			_ = json.Unmarshal(linesJSON, &po.Lines)
		}
		res = append(res, &po)
	}
	return res, nil
}

package storage

import (
	"context"
	"encoding/json"
	"errors"

	"mistake-backend/internal/domain"

	"github.com/jackc/pgx/v5"
)

func (s *PostgresStore) CreateInvoice(ctx context.Context, inv *domain.Invoice) error {
	linesJSON, _ := json.Marshal(inv.Lines)
	q := `INSERT INTO invoices (id, tenant_id, related_order_id, related_po_id, supplier_id, customer_id, invoice_number, amount_minor, currency, status, issued_at, observed_at, source_evidence_id, lines_json, created_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	      ON CONFLICT (id) DO UPDATE SET status=$10, amount_minor=$8, lines_json=$14`
	_, err := s.pool.Exec(ctx, q, inv.ID, inv.TenantID, inv.RelatedOrderID, inv.RelatedPOID, inv.SupplierID, inv.CustomerID, inv.InvoiceNumber, inv.AmountMinor, inv.Currency, inv.Status, inv.IssuedAt, inv.ObservedAt, inv.SourceEvidenceID, linesJSON, inv.CreatedAt)
	return err
}

func (s *PostgresStore) GetInvoice(ctx context.Context, tenantID, id string) (*domain.Invoice, error) {
	q := `SELECT id, tenant_id, related_order_id, related_po_id, supplier_id, customer_id, invoice_number, amount_minor, currency, status, issued_at, observed_at, source_evidence_id, lines_json, created_at
	      FROM invoices WHERE tenant_id=$1 AND id=$2`
	var inv domain.Invoice
	var linesJSON []byte
	err := s.pool.QueryRow(ctx, q, tenantID, id).Scan(&inv.ID, &inv.TenantID, &inv.RelatedOrderID, &inv.RelatedPOID, &inv.SupplierID, &inv.CustomerID, &inv.InvoiceNumber, &inv.AmountMinor, &inv.Currency, &inv.Status, &inv.IssuedAt, &inv.ObservedAt, &inv.SourceEvidenceID, &linesJSON, &inv.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if len(linesJSON) > 0 {
		_ = json.Unmarshal(linesJSON, &inv.Lines)
	}
	return &inv, err
}

func (s *PostgresStore) ListInvoices(ctx context.Context, tenantID string) ([]*domain.Invoice, error) {
	q := `SELECT id, tenant_id, related_order_id, related_po_id, supplier_id, customer_id, invoice_number, amount_minor, currency, status, issued_at, observed_at, source_evidence_id, lines_json, created_at
	      FROM invoices WHERE tenant_id=$1 ORDER BY created_at DESC`
	rows, err := s.pool.Query(ctx, q, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.Invoice
	for rows.Next() {
		var inv domain.Invoice
		var linesJSON []byte
		if err := rows.Scan(&inv.ID, &inv.TenantID, &inv.RelatedOrderID, &inv.RelatedPOID, &inv.SupplierID, &inv.CustomerID, &inv.InvoiceNumber, &inv.AmountMinor, &inv.Currency, &inv.Status, &inv.IssuedAt, &inv.ObservedAt, &inv.SourceEvidenceID, &linesJSON, &inv.CreatedAt); err != nil {
			return nil, err
		}
		if len(linesJSON) > 0 {
			_ = json.Unmarshal(linesJSON, &inv.Lines)
		}
		res = append(res, &inv)
	}
	return res, nil
}

func (s *PostgresStore) CreatePayment(ctx context.Context, p *domain.Payment) error {
	q := `INSERT INTO payments (id, tenant_id, invoice_id, amount_minor, currency, method, paid_at, source_evidence_id, created_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	      ON CONFLICT (id) DO UPDATE SET amount_minor=$4, method=$6, paid_at=$7`
	_, err := s.pool.Exec(ctx, q, p.ID, p.TenantID, p.InvoiceID, p.AmountMinor, p.Currency, p.Method, p.PaidAt, p.SourceEvidenceID, p.CreatedAt)
	return err
}

func (s *PostgresStore) ListPayments(ctx context.Context, tenantID string) ([]*domain.Payment, error) {
	q := `SELECT id, tenant_id, invoice_id, amount_minor, currency, method, paid_at, source_evidence_id, created_at FROM payments WHERE tenant_id=$1 ORDER BY created_at DESC`
	rows, err := s.pool.Query(ctx, q, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.Payment
	for rows.Next() {
		var p domain.Payment
		if err := rows.Scan(&p.ID, &p.TenantID, &p.InvoiceID, &p.AmountMinor, &p.Currency, &p.Method, &p.PaidAt, &p.SourceEvidenceID, &p.CreatedAt); err != nil {
			return nil, err
		}
		res = append(res, &p)
	}
	return res, nil
}

func (s *PostgresStore) CreateShipment(ctx context.Context, sh *domain.Shipment) error {
	q := `INSERT INTO shipments (id, tenant_id, order_id, po_id, shipment_number, status, promised_date, shipped_at, delivered_at, source_evidence_id, created_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	      ON CONFLICT (id) DO UPDATE SET status=$6, shipped_at=$8, delivered_at=$9`
	_, err := s.pool.Exec(ctx, q, sh.ID, sh.TenantID, sh.OrderID, sh.POID, sh.ShipmentNumber, sh.Status, sh.PromisedDate, sh.ShippedAt, sh.DeliveredAt, sh.SourceEvidenceID, sh.CreatedAt)
	return err
}

func (s *PostgresStore) ListShipments(ctx context.Context, tenantID string) ([]*domain.Shipment, error) {
	q := `SELECT id, tenant_id, order_id, po_id, shipment_number, status, promised_date, shipped_at, delivered_at, source_evidence_id, created_at FROM shipments WHERE tenant_id=$1 ORDER BY created_at DESC`
	rows, err := s.pool.Query(ctx, q, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.Shipment
	for rows.Next() {
		var sh domain.Shipment
		if err := rows.Scan(&sh.ID, &sh.TenantID, &sh.OrderID, &sh.POID, &sh.ShipmentNumber, &sh.Status, &sh.PromisedDate, &sh.ShippedAt, &sh.DeliveredAt, &sh.SourceEvidenceID, &sh.CreatedAt); err != nil {
			return nil, err
		}
		res = append(res, &sh)
	}
	return res, nil
}

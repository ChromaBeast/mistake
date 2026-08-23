package test

import (
	"context"
	"fmt"
	"mistake-backend/internal/detection"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// testOwnerPassword is a test-only credential for the in-memory integration
// store. It never applies to any deployed environment.
const testOwnerPassword = "integration-test-only-9f3a"

// seedFixtures builds the minimal business dataset the API integration tests
// exercise: one tenant, one owner, a supplier, and PO/invoice pairs that the
// deterministic detection engine resolves into known mistake IDs.
func seedFixtures(ctx context.Context, store storage.Store) (*domain.Tenant, *domain.User, error) {
	now := time.Now().UTC()
	tenantID := "tenant-fixtures-1"

	tenant := &domain.Tenant{
		ID: tenantID, Name: "Fixture Industries",
		LegalName: "Fixture Industries Pvt Ltd", Industry: "Test Fixtures",
		Status: domain.TenantStatusActive, CreatedAt: now.AddDate(0, -3, 0), UpdatedAt: now,
	}
	if err := store.CreateTenant(ctx, tenant); err != nil {
		return nil, nil, fmt.Errorf("create tenant: %w", err)
	}

	passHashBytes, err := bcrypt.GenerateFromPassword([]byte(testOwnerPassword), bcrypt.DefaultCost)
	if err != nil {
		return nil, nil, fmt.Errorf("hash password: %w", err)
	}
	owner := &domain.User{
		ID: "user-fixture-owner", TenantID: tenantID, Email: "owner@fixtures.test",
		Name: "Fixture Owner", PasswordHash: string(passHashBytes), Role: domain.RoleOwner,
		Status: domain.UserStatusActive, CreatedAt: now.AddDate(0, -3, 0), UpdatedAt: now,
	}
	if err := store.CreateUser(ctx, owner); err != nil {
		return nil, nil, fmt.Errorf("create owner: %w", err)
	}

	supplier := &domain.Entity{
		ID: "ent-sup-tata", TenantID: tenantID, EntityType: domain.EntityTypeSupplier,
		CanonicalName: "Tata Steel Tubes Ltd", GSTIN: "27AAACT2727Q1ZW", Status: domain.EntityStatusActive,
		CreatedAt: now.AddDate(0, -2, 0), UpdatedAt: now,
	}
	if err := store.CreateEntity(ctx, supplier); err != nil {
		return nil, nil, fmt.Errorf("create supplier: %w", err)
	}
	customer := &domain.Entity{
		ID: "ent-cust-mahindra", TenantID: tenantID, EntityType: domain.EntityTypeCustomer,
		CanonicalName: "Mahindra Heavy Auto", GSTIN: "27AABCM8888P1Z5", Status: domain.EntityStatusActive,
		CreatedAt: now.AddDate(0, -2, 0), UpdatedAt: now,
	}
	if err := store.CreateEntity(ctx, customer); err != nil {
		return nil, nil, fmt.Errorf("create customer: %w", err)
	}

	// Quantity mismatch pair (ordered 500, invoiced 450).
	orderID := "ord-mhd-4001"
	at := func(daysAgo int) *time.Time { t := now.AddDate(0, 0, -daysAgo); return &t }
	if err := store.CreateOrder(ctx, &domain.Order{
		ID: orderID, TenantID: tenantID, CustomerID: customer.ID, CustomerName: customer.CanonicalName,
		OrderNumber: "ORD-MHD-4001", Status: "completed", Currency: "INR", TotalAmountMinor: 60000000,
		ObservedAt: now.AddDate(0, 0, -9),
		Lines: []domain.OrderLine{{
			ID: "ol-1", OrderID: orderID, TenantID: tenantID, ProductName: "Forged Alloy Flange",
			Quantity: 500, UnitPriceMinor: 120000,
		}}, CreatedAt: now.AddDate(0, 0, -10),
	}); err != nil {
		return nil, nil, fmt.Errorf("create order: %w", err)
	}
	if err := store.CreateInvoice(ctx, &domain.Invoice{
		ID: "inv-mhd-8001", TenantID: tenantID, RelatedOrderID: orderID, CustomerID: customer.ID,
		InvoiceNumber: "INV-MHD-8001", AmountMinor: 54000000, Currency: "INR", Status: "issued",
		IssuedAt: at(8), ObservedAt: now.AddDate(0, 0, -8),
		Lines: []domain.InvoiceLine{{
			ID: "il-1", InvoiceID: "inv-mhd-8001", TenantID: tenantID, ProductName: "Forged Alloy Flange",
			Quantity: 450, UnitPriceMinor: 120000,
		}}, CreatedAt: now.AddDate(0, 0, -8),
	}); err != nil {
		return nil, nil, fmt.Errorf("create invoice: %w", err)
	}

	// Price mismatch pair (agreed ₹4,500/unit, billed ₹4,850/unit x1000).
	poID := "po-tata-9001"
	if err := store.CreatePurchaseOrder(ctx, &domain.PurchaseOrder{
		ID: poID, TenantID: tenantID, SupplierID: supplier.ID, SupplierName: supplier.CanonicalName,
		PONumber: "PO-TATA-9001", Status: "confirmed", Currency: "INR", TotalAmountMinor: 450000000,
		ObservedAt: now.AddDate(0, 0, -14),
		Lines: []domain.POLine{{
			ID: "pol-1", PurchaseOrderID: poID, TenantID: tenantID, ProductName: "Seamless Steel Pipes 4-inch",
			Quantity: 1000, UnitPriceMinor: 450000,
		}}, CreatedAt: now.AddDate(0, 0, -15),
	}); err != nil {
		return nil, nil, fmt.Errorf("create purchase order: %w", err)
	}
	if err := store.CreateInvoice(ctx, &domain.Invoice{
		ID: "inv-tata-3001", TenantID: tenantID, RelatedPOID: poID, SupplierID: supplier.ID,
		InvoiceNumber: "INV-TATA-3001", AmountMinor: 485000000, Currency: "INR", Status: "approved",
		IssuedAt: at(12), ObservedAt: now.AddDate(0, 0, -12),
		Lines: []domain.InvoiceLine{{
			ID: "til-1", InvoiceID: "inv-tata-3001", TenantID: tenantID, ProductName: "Seamless Steel Pipes 4-inch",
			Quantity: 1000, UnitPriceMinor: 485000,
		}}, CreatedAt: now.AddDate(0, 0, -12),
	}); err != nil {
		return nil, nil, fmt.Errorf("create po invoice: %w", err)
	}

	engine := detection.NewDetectionEngine(store)
	if _, err := engine.RunAll(ctx, tenantID); err != nil {
		return nil, nil, fmt.Errorf("detection run: %w", err)
	}

	return tenant, owner, nil
}

// sampleCSVData returns CSV bytes representing order transactions.
func sampleCSVData() []byte {
	return []byte(`type,number,customer,product,qty,price,status
order,ORD-B2B-1001,Bharat Heavy Electricals,Heavy Industrial Valve,120,4500,completed
order,ORD-B2B-1002,Larsen & Toubro Ltd,High Pressure Turbine Casing,45,35000,processing
po,PO-STEEL-2001,Jindal Steel & Power,Structural Beams ISMB 400,300,6200,approved
invoice,INV-B2B-9001,Bharat Heavy Electricals,Heavy Industrial Valve,100,4500,issued
`)
}

// sampleTSVData returns TSV bytes representing supplier invoices.
func sampleTSVData() []byte {
	return []byte("type\tnumber\tsupplier\tproduct\tqty\tprice\tstatus\n" +
		"po\tPO-RAW-501\tHindalco Industries Ltd\tAluminium Ingots Grade A\t500\t2200\tconfirmed\n" +
		"invoice\tINV-RAW-501\tHindalco Industries Ltd\tAluminium Ingots Grade A\t500\t2450\tpaid\n")
}

// sampleEmailData returns raw RFC 822 email bytes representing an invoice delivery.
func sampleEmailData() []byte {
	return []byte(`From: billing@tatasteel.com
To: accounts@fixtures.test
Subject: Invoice INV-TATA-7890 for Purchase Order PO-TATA-9001
Date: Mon, 17 Aug 2026 10:30:00 +0530

Dear Accounts Team,

Please find attached the official tax invoice INV-TATA-7890 for 500 units of Seamless Steel Pipes.
Total Amount: INR 24,25,000.00.

Regards,
Tata Steel Billing Dept
`)
}

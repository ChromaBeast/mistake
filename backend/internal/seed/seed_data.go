package seed

import (
	"context"
	"fmt"
	"mistake-backend/internal/detection"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func SeedDatabase(ctx context.Context, store storage.Store) (*domain.Tenant, *domain.User, error) {
	now := time.Now().UTC()
	tenantID := "tenant-apex-101"

	tenant := &domain.Tenant{
		ID: tenantID, Name: "Apex Precision Castings",
		LegalName: "Apex Precision Castings Pvt Ltd", Industry: "Automotive & Heavy Forging",
		Status: domain.TenantStatusActive, CreatedAt: now.AddDate(0, -3, 0), UpdatedAt: now,
	}
	_ = store.CreateTenant(ctx, tenant)

	passHashBytes, _ := bcrypt.GenerateFromPassword([]byte("Admin@123456"), bcrypt.DefaultCost)
	passHash := string(passHashBytes)

	owner := &domain.User{
		ID: "user-owner-1", TenantID: tenantID, Email: "owner@apexcastings.in",
		Name: "Rajesh Sharma", PasswordHash: passHash, Role: domain.RoleOwner,
		Status: domain.UserStatusActive, CreatedAt: now.AddDate(0, -3, 0), UpdatedAt: now,
	}
	_ = store.CreateUser(ctx, owner)

	admin := &domain.User{
		ID: "user-admin-1", TenantID: tenantID, Email: "admin@apexcastings.in",
		Name: "Priya Nair", PasswordHash: passHash, Role: domain.RoleAdmin,
		Status: domain.UserStatusActive, CreatedAt: now.AddDate(0, -3, 0), UpdatedAt: now,
	}
	_ = store.CreateUser(ctx, admin)

	analyst := &domain.User{
		ID: "user-analyst-1", TenantID: tenantID, Email: "analyst@apexcastings.in",
		Name: "Anand Verma", PasswordHash: passHash, Role: domain.RoleAnalyst,
		Status: domain.UserStatusActive, CreatedAt: now.AddDate(0, -2, 0), UpdatedAt: now,
	}
	_ = store.CreateUser(ctx, analyst)

	seedEntitiesAndBusiness(ctx, store, tenantID, now)

	// Run detection engine to discover seeded discrepancies
	engine := detection.NewDetectionEngine(store)
	_, _ = engine.RunAll(ctx, tenantID)

	return tenant, owner, nil
}

func seedEntitiesAndBusiness(ctx context.Context, store storage.Store, tenantID string, now time.Time) {
	sup1 := &domain.Entity{
		ID: "ent-sup-tata", TenantID: tenantID, EntityType: domain.EntityTypeSupplier,
		CanonicalName: "Tata Steel Tubes Ltd", GSTIN: "27AAACT2727Q1ZW", Status: domain.EntityStatusActive,
		CreatedAt: now.AddDate(0, -2, 0), UpdatedAt: now,
	}
	_ = store.CreateEntity(ctx, sup1)

	cust1 := &domain.Entity{
		ID: "ent-cust-mahindra", TenantID: tenantID, EntityType: domain.EntityTypeCustomer,
		CanonicalName: "Mahindra Heavy Auto", GSTIN: "27AABCM8888P1Z5", Status: domain.EntityStatusActive,
		CreatedAt: now.AddDate(0, -2, 0), UpdatedAt: now,
	}
	_ = store.CreateEntity(ctx, cust1)

	// 1. Order vs Invoice with Quantity Mismatch (Ordered: 500 @ ₹1,200 = 120,000 paise; Invoiced: 450 @ ₹1,200)
	orderID := "ord-mhd-4001"
	_ = store.CreateOrder(ctx, &domain.Order{
		ID: orderID, TenantID: tenantID, CustomerID: cust1.ID, CustomerName: cust1.CanonicalName,
		OrderNumber: "ORD-MHD-4001", Status: "completed", Currency: "INR", TotalAmountMinor: 60000000,
		OccurredAt: func() *time.Time { t := now.AddDate(0, 0, -10); return &t }(), ObservedAt: now.AddDate(0, 0, -9),
		Lines: []domain.OrderLine{{
			ID: "ol-1", OrderID: orderID, TenantID: tenantID, ProductName: "Forged Alloy Flange",
			Quantity: 500, UnitPriceMinor: 120000,
		}}, CreatedAt: now.AddDate(0, 0, -10),
	})

	_ = store.CreateInvoice(ctx, &domain.Invoice{
		ID: "inv-mhd-8001", TenantID: tenantID, RelatedOrderID: orderID, CustomerID: cust1.ID,
		InvoiceNumber: "INV-MHD-8001", AmountMinor: 54000000, Currency: "INR", Status: "issued",
		IssuedAt: func() *time.Time { t := now.AddDate(0, 0, -8); return &t }(), ObservedAt: now.AddDate(0, 0, -8),
		Lines: []domain.InvoiceLine{{
			ID: "il-1", InvoiceID: "inv-mhd-8001", TenantID: tenantID, ProductName: "Forged Alloy Flange",
			Quantity: 450, UnitPriceMinor: 120000,
		}}, CreatedAt: now.AddDate(0, 0, -8),
	})

	// 2. PO vs Invoice with Price Mismatch (Agreed: ₹4,500 = 450,000 paise; Billed: ₹4,850 = 485,000 paise for 1000 units)
	poID := "po-tata-9001"
	_ = store.CreatePurchaseOrder(ctx, &domain.PurchaseOrder{
		ID: poID, TenantID: tenantID, SupplierID: sup1.ID, SupplierName: sup1.CanonicalName,
		PONumber: "PO-TATA-9001", Status: "confirmed", Currency: "INR", TotalAmountMinor: 450000000,
		OccurredAt: func() *time.Time { t := now.AddDate(0, 0, -15); return &t }(), ObservedAt: now.AddDate(0, 0, -14),
		Lines: []domain.POLine{{
			ID: "pol-1", PurchaseOrderID: poID, TenantID: tenantID, ProductName: "Seamless Steel Pipes 4-inch",
			Quantity: 1000, UnitPriceMinor: 450000,
		}}, CreatedAt: now.AddDate(0, 0, -15),
	})

	_ = store.CreateInvoice(ctx, &domain.Invoice{
		ID: "inv-tata-3001", TenantID: tenantID, RelatedPOID: poID, SupplierID: sup1.ID,
		InvoiceNumber: "INV-TATA-3001", AmountMinor: 485000000, Currency: "INR", Status: "approved",
		IssuedAt: func() *time.Time { t := now.AddDate(0, 0, -12); return &t }(), ObservedAt: now.AddDate(0, 0, -12),
		Lines: []domain.InvoiceLine{{
			ID: "til-1", InvoiceID: "inv-tata-3001", TenantID: tenantID, ProductName: "Seamless Steel Pipes 4-inch",
			Quantity: 1000, UnitPriceMinor: 485000,
		}}, CreatedAt: now.AddDate(0, 0, -12),
	})

	// 3. Delayed Shipment (Promised 8 days ago, delivered 2 days ago -> 6 days delay)
	promised := now.AddDate(0, 0, -8)
	delivered := now.AddDate(0, 0, -2)
	_ = store.CreateShipment(ctx, &domain.Shipment{
		ID: "shp-901", TenantID: tenantID, OrderID: orderID, ShipmentNumber: "SHP-BLR-901",
		Status: "delivered", PromisedDate: &promised, DeliveredAt: &delivered, CreatedAt: now.AddDate(0, 0, -10),
	})

	// 4. Orphan Invoice (Missing evidence)
	_ = store.CreateInvoice(ctx, &domain.Invoice{
		ID: "inv-orphan-555", TenantID: tenantID, InvoiceNumber: "INV-UNLINKED-555",
		AmountMinor: 15000000, Currency: "INR", Status: "pending",
		IssuedAt: &now, ObservedAt: now, CreatedAt: now,
	})

	_ = store.CreateEvent(ctx, &domain.Event{
		ID: fmt.Sprintf("ev-init-%d", now.UnixNano()), TenantID: tenantID,
		EntityID: cust1.ID, EventType: domain.EventOrderCreated, Source: "erp",
		OccurredAt: &now, ObservedAt: now, Payload: map[string]interface{}{"order_id": orderID},
		Confidence: 1.0, CreatedAt: now,
	})
}

package test

import (
	"mistake-backend/internal/financial"
	"testing"
)

func TestPaiseArithmetic(t *testing.T) {
	// 1. Basic operations
	if financial.Add(100, 250) != 350 {
		t.Errorf("expected 350, got %d", financial.Add(100, 250))
	}
	if financial.Sub(500, 150) != 350 {
		t.Errorf("expected 350, got %d", financial.Sub(500, 150))
	}
	if financial.Abs(-500) != 500 || financial.Abs(500) != 500 {
		t.Errorf("Abs failed")
	}

	// 2. Quantity Mismatch: Order 500 @ ₹1,200 (120,000 paise) vs Invoice 450 @ ₹1,200
	// Delta = 50 * 120,000 = 6,000,000 paise (₹60,000.00)
	qtyImpact := financial.CalcQuantityMismatchImpact(500, 450, 120000)
	if qtyImpact != 6000000 {
		t.Errorf("expected 6,000,000 paise, got %d", qtyImpact)
	}

	// 3. Price Mismatch: PO 1000 @ ₹4,500 (450,000 paise) vs Invoice 1000 @ ₹4,850 (485,000 paise)
	// Delta = (485,000 - 450,000) * 1000 = 35,000 * 1000 = 35,000,000 paise (₹3,50,000.00)
	priceImpact := financial.CalcPriceMismatchImpact(450000, 485000, 1000)
	if priceImpact != 35000000 {
		t.Errorf("expected 35,000,000 paise, got %d", priceImpact)
	}

	// 4. Conversions
	if financial.PaiseToRupees(150000) != 1500.0 {
		t.Errorf("PaiseToRupees failed")
	}
	if financial.RupeesToPaise(1500.0) != 150000 {
		t.Errorf("RupeesToPaise failed")
	}
}

func TestIndianCurrencyFormatter(t *testing.T) {
	tests := []struct {
		paise    int64
		expected string
	}{
		{0, "₹ 0.00"},
		{150, "₹ 1.50"},
		{150000, "₹ 1,500.00"},
		{15000000, "₹ 1,50,000.00"},
		{150000000, "₹ 15,00,000.00"},
		{1500000000, "₹ 1,50,00,000.00"},
		{-15000000, "-₹ 1,50,000.00"},
	}

	for _, tt := range tests {
		res := financial.FormatPaise(tt.paise)
		if res != tt.expected {
			t.Errorf("FormatPaise(%d) = '%s'; expected '%s'", tt.paise, res, tt.expected)
		}
	}
}

func TestFormatPaiseShort(t *testing.T) {
	tests := []struct {
		paise    int64
		expected string
	}{
		{0, "₹0"},
		{5000000, "₹50 K"},
		{15000000, "₹1.5 L"},
		{2300000000, "₹2.3 Cr"},
	}

	for _, tt := range tests {
		res := financial.FormatPaiseShort(tt.paise)
		if res != tt.expected {
			t.Errorf("FormatPaiseShort(%d) = '%s'; expected '%s'", tt.paise, res, tt.expected)
		}
	}
}

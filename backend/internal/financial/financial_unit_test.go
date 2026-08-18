package financial

import "testing"

func TestFinancialPaiseMath(t *testing.T) {
	if Add(1500, 2500) != 4000 {
		t.Errorf("Add failed")
	}
	if Sub(5000, 1200) != 3800 {
		t.Errorf("Sub failed")
	}
	if MulQtyFrac(15000, 35, 10) != 52500 {
		t.Errorf("MulQtyFrac failed")
	}

	impact := CalcQuantityMismatchImpact(100.0, 80.0, 5000)
	if impact != 100000 {
		t.Errorf("expected 100,000 paise, got %d", impact)
	}

	pImpact := CalcPriceMismatchImpact(4500, 5000, 20.0)
	if pImpact != 10000 {
		t.Errorf("expected 10,000 paise, got %d", pImpact)
	}
}

func TestIndianFormatterUnit(t *testing.T) {
	formatted := FormatPaise(1250050)
	if formatted != "₹ 12,500.50" {
		t.Errorf("expected '₹ 12,500.50', got '%s'", formatted)
	}

	short := FormatPaiseShort(500000000) // ₹50 Lakhs
	if short != "₹50 L" {
		t.Errorf("expected '₹50 L', got '%s'", short)
	}
}

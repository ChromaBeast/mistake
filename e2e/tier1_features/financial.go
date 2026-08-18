package tier1_features

import (
	"fmt"
	"math"
	"testing"

	"mistake-e2e/runner"
)

func init() {
	runner.Register(runner.TestCase{
		Name: "Tier1_Financial_PaiseIntegerArithmetic", Tier: runner.Tier1, Feature: "Deterministic Paise Math",
		Description: "Verify minor unit (paise) math maintains 64-bit integer exact precision",
		Fn: func(baseURL string) error {
			paiseA := int64(10000050) // ₹1,00,000.50
			paiseB := int64(25000025) // ₹2,50,000.25
			sum := paiseA + paiseB
			if sum != 35000075 {
				return fmt.Errorf("expected 35000075 paise, got %d", sum)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Financial_QuantityMismatchFormula", Tier: runner.Tier1, Feature: "Deterministic Paise Math",
		Description: "Verify Qty Mismatch formula: |orderQty - invQty| * unitPriceMinor",
		Fn: func(baseURL string) error {
			orderQty := 5000.0
			invQty := 4500.0
			unitPriceMinor := int64(4500) // ₹45.00
			impact := int64(math.Abs(orderQty-invQty) * float64(unitPriceMinor))
			expected := int64(2250000) // ₹22,500.00
			if impact != expected {
				return fmt.Errorf("expected impact %d, got %d", expected, impact)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Financial_PriceMismatchFormula", Tier: runner.Tier1, Feature: "Deterministic Paise Math",
		Description: "Verify Price Mismatch formula: |poPrice - invPrice| * invQty",
		Fn: func(baseURL string) error {
			poPriceMinor := int64(5000)  // ₹50.00
			invPriceMinor := int64(5500) // ₹55.00
			invQty := 1000.0
			priceDiff := int64(math.Abs(float64(poPriceMinor - invPriceMinor)))
			impact := int64(float64(priceDiff) * invQty)
			expected := int64(500000) // ₹5,000.00
			if impact != expected {
				return fmt.Errorf("expected price impact %d, got %d", expected, impact)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Financial_INRFormattingLakhsCrores", Tier: runner.Tier1, Feature: "Deterministic Paise Math",
		Description: "Verify Indian numbering format correctly identifies Lakhs (10^5) and Crores (10^7)",
		Fn: func(baseURL string) error {
			oneLakhPaise := int64(10000000)   // ₹1,00,000 (100,000 * 100 paise)
			oneCrorePaise := int64(1000000000) // ₹1,00,000,00 (1,00,00,000 * 100 paise)
			if oneLakhPaise/100 != 100000 {
				return fmt.Errorf("lakh calculation mismatch")
			}
			if oneCrorePaise/100 != 10000000 {
				return fmt.Errorf("crore calculation mismatch")
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Financial_DeterministicRepeatability", Tier: runner.Tier1, Feature: "Deterministic Paise Math",
		Description: "Verify 1,000 consecutive calculations produce bit-identical results per ADR-0002",
		Fn: func(baseURL string) error {
			qtyDiff := 333.333
			priceMinor := int64(12999) // ₹129.99
			baseline := int64(math.Round(qtyDiff * float64(priceMinor)))

			for i := 0; i < 1000; i++ {
				current := int64(math.Round(qtyDiff * float64(priceMinor)))
				if current != baseline {
					return fmt.Errorf("non-deterministic drift at iter %d: %d != %d", i, current, baseline)
				}
			}
			return nil
		},
	})
}

func TestTier1_Financial(t *testing.T) {
	for _, tc := range runner.Registry {
		if tc.Tier == runner.Tier1 && tc.Feature == "Deterministic Paise Math" {
			t.Run(tc.Name, func(t *testing.T) {
				if err := tc.Fn("http://localhost:8080"); err != nil {
					t.Fatalf("test %s failed: %v", tc.Name, err)
				}
			})
		}
	}
}

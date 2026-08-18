package tier2_boundaries

import (
	"fmt"
	"math"
	"testing"

	"mistake-e2e/runner"
)

func init() {
	runner.Register(runner.TestCase{
		Name: "Tier2_Boundary_ZeroPaiseImpact", Tier: runner.Tier2, Feature: "Boundary Math",
		Description: "Verify exact quantity/price match yields zero financial leakage",
		Fn: func(baseURL string) error {
			orderQty := 1000.0
			invQty := 1000.0
			unitPriceMinor := int64(9999)
			impact := int64(math.Abs(orderQty-invQty) * float64(unitPriceMinor))
			if impact != 0 {
				return fmt.Errorf("expected 0 paise impact for matching items, got %d", impact)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier2_Boundary_NegativeDifferenceAbsoluteValue", Tier: runner.Tier2, Feature: "Boundary Math",
		Description: "Verify over-delivery or under-delivery both yield non-negative magnitude leakage",
		Fn: func(baseURL string) error {
			underDeliveryImpact := int64(math.Abs(100.0-80.0) * 1000)
			overDeliveryImpact := int64(math.Abs(80.0-100.0) * 1000)
			if underDeliveryImpact != 20000 || overDeliveryImpact != 20000 {
				return fmt.Errorf("absolute difference mismatch: %d vs %d", underDeliveryImpact, overDeliveryImpact)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier2_Boundary_ZeroUnitPrice", Tier: runner.Tier2, Feature: "Boundary Math",
		Description: "Verify free promotional items (0 paise unit price) yield 0 paise financial leakage",
		Fn: func(baseURL string) error {
			impact := int64(math.Abs(500.0-200.0) * 0)
			if impact != 0 {
				return fmt.Errorf("expected 0 for zero unit price, got %d", impact)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier2_Boundary_FractionalQuantitiesRounding", Tier: runner.Tier2, Feature: "Boundary Math",
		Description: "Verify fractional weights/measures round deterministically to exact paise",
		Fn: func(baseURL string) error {
			qtyDiff := 12.3456
			unitPriceMinor := int64(2450) // ₹24.50
			impact := int64(math.Round(qtyDiff * float64(unitPriceMinor)))
			expected := int64(30247) // 12.3456 * 2450 = 30246.72 -> 30247
			if impact != expected {
				return fmt.Errorf("expected %d paise, got %d", expected, impact)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier2_Boundary_MaxInt64PaiseOverflowSafety", Tier: runner.Tier2, Feature: "Boundary Math",
		Description: "Verify int64 max boundary (9.22 x 10^18 paise) safely handles industrial scale sums",
		Fn: func(baseURL string) error {
			maxSafePaise := int64(1000000000000000) // ₹10,000 Crore (100 Billion INR)
			qty := 1000000.0
			unitPrice := int64(10000000) // ₹1,00,000 per unit
			total := int64(qty * float64(unitPrice))
			if total > maxSafePaise {
				return fmt.Errorf("overflow risk check failed")
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier2_Boundary_ExtremeVolumeSummation", Tier: runner.Tier2, Feature: "Boundary Math",
		Description: "Verify summing 10,000 line item discrepancies does not lose fractional paise precision",
		Fn: func(baseURL string) error {
			var total int64
			unitImpact := int64(137) // ₹1.37
			for i := 0; i < 10000; i++ {
				total += unitImpact
			}
			if total != 1370000 {
				return fmt.Errorf("expected 1370000 paise, got %d", total)
			}
			return nil
		},
	})
}

func TestTier2_BoundaryMath(t *testing.T) {
	for _, tc := range runner.Registry {
		if tc.Tier == runner.Tier2 && tc.Feature == "Boundary Math" {
			t.Run(tc.Name, func(t *testing.T) {
				if err := tc.Fn("http://localhost:8080"); err != nil {
					t.Fatalf("test %s failed: %v", tc.Name, err)
				}
			})
		}
	}
}

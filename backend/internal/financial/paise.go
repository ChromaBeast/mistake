package financial

import "math"

// Add computes exact sum of two paise amounts.
func Add(a, b int64) int64 {
	return a + b
}

// Sub computes exact difference of two paise amounts.
func Sub(a, b int64) int64 {
	return a - b
}

// Abs computes absolute value of an int64 paise amount.
func Abs(a int64) int64 {
	if a < 0 {
		return -a
	}
	return a
}

// MulQty multiplies a unit price in paise by quantity and rounds deterministically to integer paise.
// Deprecated: use MulQtyFrac for safe integer math.
func MulQty(unitPriceMinor int64, qty float64) int64 {
	num := int64(math.Round(qty * 10000))
	return MulQtyFrac(unitPriceMinor, num, 10000)
}

// MulQtyFrac does exact integer math for price * quantity
func MulQtyFrac(unitPriceMinor int64, qtyNumerator, qtyDenominator int64) int64 {
	return unitPriceMinor * qtyNumerator / qtyDenominator
}

// CalcQuantityMismatchImpact calculates deterministic financial leakage in paise:
// |orderQty - invoiceQty| * invoiceUnitPriceMinor
func CalcQuantityMismatchImpact(orderQty, invoiceQty float64, invoiceUnitPriceMinor int64) int64 {
	diffQty := math.Abs(orderQty - invoiceQty)
	num := int64(math.Round(diffQty * 10000))
	return MulQtyFrac(invoiceUnitPriceMinor, num, 10000)
}

// CalcPriceMismatchImpact calculates deterministic financial leakage in paise:
// |poUnitPriceMinor - invoiceUnitPriceMinor| * invoiceQty
func CalcPriceMismatchImpact(poUnitPriceMinor, invoiceUnitPriceMinor int64, invoiceQty float64) int64 {
	unitDiff := Abs(poUnitPriceMinor - invoiceUnitPriceMinor)
	num := int64(math.Round(math.Abs(invoiceQty) * 10000))
	return MulQtyFrac(unitDiff, num, 10000)
}

// PaiseToRupees converts minor units to floating point INR for display/reporting.
func PaiseToRupees(paise int64) float64 {
	return float64(paise) / 100.0
}

// RupeesToPaise converts floating INR to exact minor integer paise.
func RupeesToPaise(rupees float64) int64 {
	return int64(math.Round(rupees * 100.0))
}

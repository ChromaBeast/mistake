package detection

import (
	"fmt"
	"mistake-backend/internal/domain"
)

type CompoundAggregator struct{}

func NewCompoundAggregator() *CompoundAggregator {
	return &CompoundAggregator{}
}

// GroupCompoundMistakes identifies mistakes that reference the same business object (e.g. PO/order number)
// and assigns a shared CompoundGroupID so they can be reviewed together without double-counting financial impact.
func (a *CompoundAggregator) GroupCompoundMistakes(mistakes []*domain.Mistake) []*domain.Mistake {
	if len(mistakes) <= 1 {
		return mistakes
	}

	byRef := make(map[string][]*domain.Mistake)
	for _, m := range mistakes {
		key := m.TenantID + ":" + m.ReferenceNumber
		if m.ReferenceNumber != "" {
			byRef[key] = append(byRef[key], m)
		}
	}

	for key, group := range byRef {
		if len(group) > 1 {
			compoundID := fmt.Sprintf("cmp-%s", key)
			for _, m := range group {
				m.CompoundGroupID = compoundID
				m.IsCompound = true
			}
		}
	}

	return mistakes
}

// CalculateCompoundImpact computes additive financial impact across related discrepancies.
func (a *CompoundAggregator) CalculateCompoundImpact(mistakes []*domain.Mistake) int64 {
	var total int64
	for _, m := range mistakes {
		total += m.FinancialImpactMinor
	}
	return total
}

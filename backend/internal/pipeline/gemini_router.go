package pipeline

import (
	"context"
	"fmt"
	"log/slog"
	"os"
)


type ModelTier string

const (
	TierFrontier ModelTier = "frontier"
	TierStandard ModelTier = "standard"
)

// GeminiModelRouter manages tiered model execution with configured fallback chains.
type GeminiModelRouter struct {
	FrontierChain []string
	StandardChain []string
	APIKey        string
}

func NewGeminiModelRouter() *GeminiModelRouter {
	apiKey := os.Getenv("GEMINI_API_KEY")
	return &GeminiModelRouter{
		// Frontier Tier: complex reasoning, contract reconciliation, explanation generation
		FrontierChain: []string{
			"gemini-3.7-flash",
			"gemini-3.6-flash",
			"gemini-3.5-flash",
		},

		// Standard Tier: high-throughput OCR and multi-format fact extraction
		StandardChain: []string{
			"gemini-3.5-flash-lite",
			"gemini-3.1-flash-lite",
		},
		APIKey: apiKey,
	}
}

// GetChain returns the ordered priority chain for a given tier.
func (r *GeminiModelRouter) GetChain(tier ModelTier) []string {
	if tier == TierFrontier {
		return r.FrontierChain
	}
	return r.StandardChain
}

// GetPrimaryModel returns the primary active model for a tier.
func (r *GeminiModelRouter) GetPrimaryModel(tier ModelTier) string {
	chain := r.GetChain(tier)
	if len(chain) > 0 {
		return chain[0]
	}
	return "gemini-3.7-flash"
}

// ExecuteWithFallback attempts execution through the tier chain until success.
func (r *GeminiModelRouter) ExecuteWithFallback(
	ctx context.Context,
	tier ModelTier,
	fn func(ctx context.Context, modelName string) (string, error),
) (string, string, error) {
	chain := r.GetChain(tier)
	var lastErr error

	for _, model := range chain {
		select {
		case <-ctx.Done():
			return "", "", ctx.Err()
		default:
		}

		res, err := fn(ctx, model)
		if err == nil {
			return res, model, nil
		}

		lastErr = err
		slog.Warn("Gemini model execution failed, falling back to next model",
			"tier", tier,
			"failed_model", model,
			"error", err,
		)
	}

	return "", "", fmt.Errorf("all models in tier %s failed: %w", tier, lastErr)
}

// RouteForSourceType determines the appropriate model tier based on document complexity.
func RouteForSourceType(sourceType string) ModelTier {
	switch sourceType {
	case "pdf", "email_export", "unstructured":
		return TierFrontier
	default:
		return TierStandard
	}
}

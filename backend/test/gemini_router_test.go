package test

import (
	"context"
	"errors"
	"testing"

	"mistake-backend/internal/pipeline"
)

func TestGeminiModelRouterChains(t *testing.T) {
	router := pipeline.NewGeminiModelRouter()

	// 1. Verify Frontier Tier: gemini-3.7-flash -> gemini-3.6-flash -> gemini-3.5-flash
	frontierChain := router.GetChain(pipeline.TierFrontier)
	if len(frontierChain) != 3 {
		t.Fatalf("expected 3 models in frontier chain, got %d", len(frontierChain))
	}
	if frontierChain[0] != "gemini-3.7-flash" || frontierChain[1] != "gemini-3.6-flash" || frontierChain[2] != "gemini-3.5-flash" {
		t.Errorf("unexpected frontier chain: %+v", frontierChain)
	}

	// 2. Verify Standard Tier: gemini-3.5-flash-lite -> gemini-3.1-flash-lite
	standardChain := router.GetChain(pipeline.TierStandard)
	if len(standardChain) != 2 {
		t.Fatalf("expected 2 models in standard chain, got %d", len(standardChain))
	}
	if standardChain[0] != "gemini-3.5-flash-lite" || standardChain[1] != "gemini-3.1-flash-lite" {
		t.Errorf("unexpected standard chain: %+v", standardChain)
	}

	// 3. Test Fallback Execution on Frontier Tier
	ctx := context.Background()
	attempts := []string{}
	res, usedModel, err := router.ExecuteWithFallback(ctx, pipeline.TierFrontier, func(ctx context.Context, modelName string) (string, error) {
		attempts = append(attempts, modelName)
		if modelName == "gemini-3.7-flash" {
			return "", errors.New("rate limited (429)")
		}
		return "Extraction successful", nil
	})

	if err != nil {
		t.Fatalf("fallback execution failed: %v", err)
	}
	if usedModel != "gemini-3.6-flash" {
		t.Errorf("expected fallback to gemini-3.6-flash, got %s", usedModel)
	}
	if res != "Extraction successful" {
		t.Errorf("unexpected result: %s", res)
	}
	if len(attempts) != 2 || attempts[0] != "gemini-3.7-flash" || attempts[1] != "gemini-3.6-flash" {
		t.Errorf("unexpected execution path: %+v", attempts)
	}
}


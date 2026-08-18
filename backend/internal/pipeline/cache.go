package pipeline

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
)

const (
	CurrentExtractionVersion = "v1.0"
	CurrentModelVersion      = "deterministic-extractor-v1"
)

// ComputeFileHash calculates SHA256 hex string from an io.Reader.
func ComputeFileHash(r io.Reader) (string, error) {
	h := sha256.New()
	if _, err := io.Copy(h, r); err != nil {
		return "", err
	}
	return hex.EncodeToString(h.Sum(nil)), nil
}

// BuildCacheKey returns the deterministic cache key for deduplication.
func BuildCacheKey(fileHash, extVersion, modelVersion string) string {
	return fmt.Sprintf("%s:%s:%s", fileHash, extVersion, modelVersion)
}

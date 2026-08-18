package harness

import (
	"fmt"
	"strings"
	"testing"
)

// AssertStatusCode checks if response HTTP status code matches expected.
func AssertStatusCode(t *testing.T, resp *APIResponse, expected int) {
	t.Helper()
	if resp == nil {
		t.Fatalf("expected status code %d, but received nil APIResponse", expected)
	}
	if resp.StatusCode != expected {
		t.Fatalf("expected status code %d, got %d (error: %+v, data: %+v)",
			expected, resp.StatusCode, resp.Error, resp.Data)
	}
}

// AssertErrorCode checks if the error code in the response matches expected string.
func AssertErrorCode(t *testing.T, resp *APIResponse, expectedCode string) {
	t.Helper()
	if resp == nil || resp.Error == nil {
		t.Fatalf("expected error code %q, but got no error object (status: %d)",
			expectedCode, resp.StatusCode)
	}
	if resp.Error.Code != expectedCode {
		t.Fatalf("expected error code %q, got %q (message: %s)",
			expectedCode, resp.Error.Code, resp.Error.Message)
	}
}

// AssertEqual checks value equality.
func AssertEqual[T comparable](t *testing.T, actual, expected T, msg string) {
	t.Helper()
	if actual != expected {
		t.Fatalf("%s: expected %v, got %v", msg, expected, actual)
	}
}

// AssertNotEqual checks value inequality.
func AssertNotEqual[T comparable](t *testing.T, actual, expected T, msg string) {
	t.Helper()
	if actual == expected {
		t.Fatalf("%s: expected value not to equal %v", msg, expected)
	}
}

// AssertTrue checks boolean condition is true.
func AssertTrue(t *testing.T, cond bool, msg string) {
	t.Helper()
	if !cond {
		t.Fatalf("assert true failed: %s", msg)
	}
}

// AssertFalse checks boolean condition is false.
func AssertFalse(t *testing.T, cond bool, msg string) {
	t.Helper()
	if cond {
		t.Fatalf("assert false failed: %s", msg)
	}
}

// AssertNil checks if value is nil.
func AssertNil(t *testing.T, val any, msg string) {
	t.Helper()
	if val != nil {
		t.Fatalf("%s: expected nil, got %+v", msg, val)
	}
}

// AssertNotNil checks if value is not nil.
func AssertNotNil(t *testing.T, val any, msg string) {
	t.Helper()
	if val == nil {
		t.Fatalf("%s: expected non-nil value", msg)
	}
}

// AssertContains checks if s contains substr.
func AssertContains(t *testing.T, s, substr, msg string) {
	t.Helper()
	if !strings.Contains(s, substr) {
		t.Fatalf("%s: expected string %q to contain %q", msg, s, substr)
	}
}

// AssertPaiseEqual checks equality of two int64 minor unit (paise) values.
func AssertPaiseEqual(t *testing.T, actual, expected int64, contextMsg string) {
	t.Helper()
	if actual != expected {
		t.Fatalf("%s: expected %d paise (₹%.2f), got %d paise (₹%.2f)",
			contextMsg, expected, float64(expected)/100.0, actual, float64(actual)/100.0)
	}
}

// AssertLen checks the length of a slice.
func AssertLen[T any](t *testing.T, slice []T, expectedLen int, msg string) {
	t.Helper()
	if len(slice) != expectedLen {
		t.Fatalf("%s: expected slice length %d, got %d", msg, expectedLen, len(slice))
	}
}

// FormatErrorMsg formats an error message with context.
func FormatErrorMsg(prefix string, err error) string {
	if err == nil {
		return prefix
	}
	return fmt.Sprintf("%s: %v", prefix, err)
}

package harness

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"strings"
	"time"
)

// Client handles HTTP interactions with the Mistake API.
type Client struct {
	BaseURL    string
	HTTPClient *http.Client
	Token      string
	TenantID   string
	Headers    map[string]string
}

// NewClient creates a new API client pointing to the specified base URL.
func NewClient(baseURL string) *Client {
	cleanURL := strings.TrimRight(baseURL, "/")
	return &Client{
		BaseURL: cleanURL,
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
		Headers: make(map[string]string),
	}
}

// SetToken sets the Bearer authorization token.
func (c *Client) SetToken(token string) {
	c.Token = token
}

// SetHeader sets a custom header on all subsequent requests.
func (c *Client) SetHeader(k, v string) {
	c.Headers[k] = v
}

// Post sends a POST request with JSON body.
func (c *Client) Post(path string, body any) (*APIResponse, error) {
	return c.sendJSON(http.MethodPost, path, body)
}

// Get sends a GET request.
func (c *Client) Get(path string) (*APIResponse, error) {
	return c.sendJSON(http.MethodGet, path, nil)
}

// Patch sends a PATCH request with JSON body.
func (c *Client) Patch(path string, body any) (*APIResponse, error) {
	return c.sendJSON(http.MethodPatch, path, body)
}

// Delete sends a DELETE request.
func (c *Client) Delete(path string) (*APIResponse, error) {
	return c.sendJSON(http.MethodDelete, path, nil)
}

// UploadFile sends a multipart/form-data upload request.
func (c *Client) UploadFile(path, fieldName, fileName string, content []byte) (*APIResponse, error) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile(fieldName, fileName)
	if err != nil {
		return nil, fmt.Errorf("create form file: %w", err)
	}
	if _, err := part.Write(content); err != nil {
		return nil, fmt.Errorf("write form content: %w", err)
	}
	if err := writer.Close(); err != nil {
		return nil, fmt.Errorf("close writer: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, c.buildURL(path), body)
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())
	c.applyHeaders(req)

	return c.execute(req)
}

func (c *Client) sendJSON(method, path string, body any) (*APIResponse, error) {
	var bodyReader io.Reader
	if body != nil {
		data, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("marshal json body: %w", err)
		}
		bodyReader = bytes.NewReader(data)
	}

	req, err := http.NewRequest(method, c.buildURL(path), bodyReader)
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	c.applyHeaders(req)

	return c.execute(req)
}

func (c *Client) buildURL(path string) string {
	if strings.HasPrefix(path, "http://") || strings.HasPrefix(path, "https://") {
		return path
	}
	p := "/" + strings.TrimLeft(path, "/")
	if !strings.HasPrefix(p, "/api/v1") {
		p = "/api/v1" + p
	}
	return c.BaseURL + p
}

func (c *Client) applyHeaders(req *http.Request) {
	if c.Token != "" {
		req.Header.Set("Authorization", "Bearer "+c.Token)
	}
	for k, v := range c.Headers {
		req.Header.Set(k, v)
	}
}

func (c *Client) execute(req *http.Request) (*APIResponse, error) {
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return &APIResponse{StatusCode: 0, Error: &APIError{Code: "HTTP_ERROR", Message: err.Error()}}, fmt.Errorf("execute request: %w", err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return &APIResponse{StatusCode: resp.StatusCode, Error: &APIError{Code: "READ_ERROR", Message: err.Error()}}, fmt.Errorf("read response: %w", err)
	}

	apiResp := &APIResponse{
		StatusCode: resp.StatusCode,
	}

	if len(respBytes) > 0 {
		var raw map[string]any
		if err := json.Unmarshal(respBytes, &raw); err == nil {
			apiResp.Data = raw
			if errVal, ok := raw["error"]; ok && errVal != nil {
				var apiErr APIError
				errBytes, _ := json.Marshal(errVal)
				if err := json.Unmarshal(errBytes, &apiErr); err == nil {
					apiResp.Error = &apiErr
				}
			}
		}
	}
	return apiResp, nil
}

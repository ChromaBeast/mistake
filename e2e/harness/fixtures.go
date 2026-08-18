package harness

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

// GenerateOrderCSV creates standard CSV content for an order.
func GenerateOrderCSV(orderNum, customerName, sku string, qty int, unitPriceMinor int64) []byte {
	var buf bytes.Buffer
	buf.WriteString("order_number,customer_name,sku,quantity,unit_price_minor,currency\n")
	buf.WriteString(fmt.Sprintf("%s,%s,%s,%d,%d,INR\n", orderNum, customerName, sku, qty, unitPriceMinor))
	return buf.Bytes()
}

// GenerateInvoiceCSV creates standard CSV content for an invoice.
func GenerateInvoiceCSV(invNum, poNum, customerName, sku string, qty int, unitPriceMinor int64) []byte {
	var buf bytes.Buffer
	buf.WriteString("invoice_number,po_number,customer_name,sku,quantity,unit_price_minor,currency\n")
	buf.WriteString(fmt.Sprintf("%s,%s,%s,%s,%d,%d,INR\n", invNum, poNum, customerName, sku, qty, unitPriceMinor))
	return buf.Bytes()
}

// GenerateAutoSupplierBatchCSV creates auto component CSV with known discrepancy.
func GenerateAutoSupplierBatchCSV() []byte {
	var buf bytes.Buffer
	buf.WriteString("doc_type,ref_no,entity_name,sku,quantity,unit_price_minor,status\n")
	buf.WriteString("order,ORD-AUTO-101,Bajaj Auto Ltd,BRK-PAD-01,5000,45000,confirmed\n")
	buf.WriteString("invoice,INV-AUTO-101,Bajaj Auto Limited,BRK-PAD-01,4800,48000,issued\n")
	return buf.Bytes()
}

// GeneratePharmaBatchCSV creates pharma distribution batch with delayed dates.
func GeneratePharmaBatchCSV() []byte {
	var buf bytes.Buffer
	buf.WriteString("doc_type,ref_no,entity_name,sku,quantity,unit_price_minor,promised_date,delivery_date\n")
	buf.WriteString("order,ORD-PHARMA-501,Cipla Healthcare,PARACET-500,10000,250,2026-08-01,2026-08-01\n")
	buf.WriteString("shipment,SHP-PHARMA-501,Cipla Healthcare,PARACET-500,10000,250,2026-08-01,2026-08-15\n")
	buf.WriteString("invoice,INV-ORPHAN-999,Sun Pharma Dist,AZITHRO-250,2000,1200,,2026-08-10\n")
	return buf.Bytes()
}

// GenerateFMCGBatchCSV creates FMCG wholesaler batch with status mismatch.
func GenerateFMCGBatchCSV() []byte {
	var buf bytes.Buffer
	buf.WriteString("doc_type,ref_no,entity_name,sku,quantity,unit_price_minor,status\n")
	buf.WriteString("order,ORD-FMCG-801,Hindustan Unilever Ltd,SOAP-LUX-100,2000,3500,cancelled\n")
	buf.WriteString("shipment,SHP-FMCG-801,HUL Wholesale Dist,SOAP-LUX-100,2000,3500,delivered\n")
	buf.WriteString("invoice,INV-FMCG-801,Hindustan Unilever Limited,SOAP-LUX-100,2000,3500,paid\n")
	return buf.Bytes()
}

// GenerateMalformedCSV returns corrupted CSV bytes for error boundary testing.
func GenerateMalformedCSV() []byte {
	return []byte("order_number,customer_name\n\"UNCLOSED_QUOTE,Bajaj Auto\nINVALID_ROW_WITHOUT_DELIMITERS")
}

// GenerateFakePDF creates pseudo-PDF binary payload with valid magic header.
func GenerateFakePDF(title string) []byte {
	content := fmt.Sprintf("%%PDF-1.4\n1 0 obj\n<< /Title (%s) >>\nendobj\n%%EOF", title)
	return []byte(content)
}

// GenerateFakeXLSX creates pseudo-XLSX payload with zip magic header.
func GenerateFakeXLSX(sheetName string) []byte {
	magic := []byte{0x50, 0x4B, 0x03, 0x04} // PK zip header
	payload := []byte(fmt.Sprintf("[Content_Types].xml Sheet=%s", sheetName))
	return append(magic, payload...)
}

// CalculateSHA256 returns hex encoded sha256 hash.
func CalculateSHA256(data []byte) string {
	sum := sha256.Sum256(data)
	return hex.EncodeToString(sum[:])
}

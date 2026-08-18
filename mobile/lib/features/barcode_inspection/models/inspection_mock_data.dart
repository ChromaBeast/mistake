import '../../../models/inspection_item.dart';

class InspectionMockData {
  static InspectionItem lookupBarcode(String barcode) {
    if (barcode.contains('EWAY')) {
      return InspectionItem(
        barcode: barcode,
        barcodeType: 'GST E-Way Bill QR',
        sku: 'STL-PIPE-GALV-4IN',
        description: '4-inch Galvanized Seamless Steel Pipes (10m length)',
        poNumber: 'PO-4091',
        invoiceNumber: 'INV-8819',
        supplierName: 'Tata Steel Tubes Division',
        expectedQuantity: 5000,
        receivedQuantity: 4500,
        unitPriceMinor: 9500, // ₹95.00
        varianceAmountMinor: 4750000, // ₹47,500.00
        discrepancyType: InspectionDiscrepancyType.quantityMismatch,
        scannedAt: DateTime.now(),
      );
    } else if (barcode.contains('PO-QR')) {
      return InspectionItem(
        barcode: barcode,
        barcodeType: 'Purchase Order QR Tag',
        sku: 'ALU-INGOT-6061',
        description: 'Grade 6061 Extrusion Alloy Aluminum Ingots',
        poNumber: 'PO-3892',
        invoiceNumber: 'INV-9021',
        supplierName: 'Hindalco Industries Ltd.',
        expectedQuantity: 1000,
        receivedQuantity: 1000,
        unitPriceMinor: 32000, // ₹320.00 vs contract ₹285.00
        varianceAmountMinor: 3500000, // ₹35,000.00
        discrepancyType: InspectionDiscrepancyType.priceMismatch,
        scannedAt: DateTime.now(),
      );
    } else if (barcode.contains('INV-MATCH')) {
      return InspectionItem(
        barcode: barcode,
        barcodeType: 'Code-128 Barcode',
        sku: 'FAST-HEX-M12',
        description: 'M12 High-Tensile Hex Bolt Fasteners (Box of 500)',
        poNumber: 'PO-4100',
        invoiceNumber: 'INV-9901',
        supplierName: 'Sundram Fasteners Ltd.',
        expectedQuantity: 200,
        receivedQuantity: 200,
        unitPriceMinor: 15000, // ₹150.00
        varianceAmountMinor: 0,
        discrepancyType: InspectionDiscrepancyType.perfectMatch,
        status: InspectionStatus.accepted,
        scannedAt: DateTime.now(),
      );
    } else {
      return InspectionItem(
        barcode: barcode,
        barcodeType: 'Unknown Format',
        sku: 'UNKNOWN-SKU',
        description: 'Unregistered barcode payload',
        poNumber: 'N/A',
        invoiceNumber: 'N/A',
        supplierName: 'Unassigned Supplier',
        expectedQuantity: 0,
        receivedQuantity: 1,
        unitPriceMinor: 0,
        varianceAmountMinor: 0,
        discrepancyType: InspectionDiscrepancyType.unrecognizedBarcode,
        scannedAt: DateTime.now(),
      );
    }
  }
}

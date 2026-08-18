enum InspectionDiscrepancyType {
  quantityMismatch,
  priceMismatch,
  unrecognizedBarcode,
  expiredBatch,
  perfectMatch,
}

enum InspectionStatus {
  pendingVerification,
  accepted,
  flagged,
  escalated,
}

class InspectionItem {
  final String barcode;
  final String barcodeType;
  final String sku;
  final String description;
  final String poNumber;
  final String invoiceNumber;
  final String supplierName;
  final int expectedQuantity;
  final int receivedQuantity;
  final int unitPriceMinor; // in paise
  final int varianceAmountMinor; // in paise
  final InspectionDiscrepancyType discrepancyType;
  final InspectionStatus status;
  final DateTime scannedAt;
  final String? inspectorNotes;
  final String? attachedPhotoUri;

  const InspectionItem({
    required this.barcode,
    required this.barcodeType,
    required this.sku,
    required this.description,
    required this.poNumber,
    required this.invoiceNumber,
    required this.supplierName,
    required this.expectedQuantity,
    required this.receivedQuantity,
    required this.unitPriceMinor,
    required this.varianceAmountMinor,
    required this.discrepancyType,
    this.status = InspectionStatus.pendingVerification,
    required this.scannedAt,
    this.inspectorNotes,
    this.attachedPhotoUri,
  });

  bool get hasVariance => varianceAmountMinor > 0 || discrepancyType != InspectionDiscrepancyType.perfectMatch;

  InspectionItem copyWith({
    String? barcode,
    String? barcodeType,
    String? sku,
    String? description,
    String? poNumber,
    String? invoiceNumber,
    String? supplierName,
    int? expectedQuantity,
    int? receivedQuantity,
    int? unitPriceMinor,
    int? varianceAmountMinor,
    InspectionDiscrepancyType? discrepancyType,
    InspectionStatus? status,
    DateTime? scannedAt,
    String? inspectorNotes,
    String? attachedPhotoUri,
  }) {
    return InspectionItem(
      barcode: barcode ?? this.barcode,
      barcodeType: barcodeType ?? this.barcodeType,
      sku: sku ?? this.sku,
      description: description ?? this.description,
      poNumber: poNumber ?? this.poNumber,
      invoiceNumber: invoiceNumber ?? this.invoiceNumber,
      supplierName: supplierName ?? this.supplierName,
      expectedQuantity: expectedQuantity ?? this.expectedQuantity,
      receivedQuantity: receivedQuantity ?? this.receivedQuantity,
      unitPriceMinor: unitPriceMinor ?? this.unitPriceMinor,
      varianceAmountMinor: varianceAmountMinor ?? this.varianceAmountMinor,
      discrepancyType: discrepancyType ?? this.discrepancyType,
      status: status ?? this.status,
      scannedAt: scannedAt ?? this.scannedAt,
      inspectorNotes: inspectorNotes ?? this.inspectorNotes,
      attachedPhotoUri: attachedPhotoUri ?? this.attachedPhotoUri,
    );
  }
}

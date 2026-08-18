import 'package:flutter/material.dart';

enum DocumentType {
  taxInvoice,
  purchaseOrder,
  goodsReceiptNote,
  ewayBill,
  debitCreditNote,
}

extension DocumentTypeExtension on DocumentType {
  String get displayName {
    switch (this) {
      case DocumentType.taxInvoice:
        return 'Tax Invoice (GST)';
      case DocumentType.purchaseOrder:
        return 'Purchase Order (PO)';
      case DocumentType.goodsReceiptNote:
        return 'Goods Receipt (GRN)';
      case DocumentType.ewayBill:
        return 'GST E-Way Bill';
      case DocumentType.debitCreditNote:
        return 'Debit / Credit Note';
    }
  }
}

enum IngestionStage {
  queued,
  processing,
  extracting,
  analyzing,
  completed,
  failed,
}

extension IngestionStageExtension on IngestionStage {
  String get displayName {
    switch (this) {
      case IngestionStage.queued:
        return 'Queued';
      case IngestionStage.processing:
        return 'Uploading & Preprocessing';
      case IngestionStage.extracting:
        return 'Extracting Facts & Tables';
      case IngestionStage.analyzing:
        return 'Cross-Verifying Financials';
      case IngestionStage.completed:
        return 'Completed';
      case IngestionStage.failed:
        return 'Failed';
    }
  }

  double get progressValue {
    switch (this) {
      case IngestionStage.queued:
        return 0.10;
      case IngestionStage.processing:
        return 0.35;
      case IngestionStage.extracting:
        return 0.65;
      case IngestionStage.analyzing:
        return 0.85;
      case IngestionStage.completed:
        return 1.00;
      case IngestionStage.failed:
        return 1.00;
    }
  }
}

class ScannedPage {
  final String id;
  final int pageNumber;
  final DateTime capturedAt;
  final List<Offset> detectedCorners;
  final double ambientLux;
  final String? simulatedImageBase64;

  const ScannedPage({
    required this.id,
    required this.pageNumber,
    required this.capturedAt,
    this.detectedCorners = const [],
    this.ambientLux = 450.0,
    this.simulatedImageBase64,
  });
}

class DocumentScanBatch {
  final String id;
  final DocumentType type;
  final String? poReference;
  final String? vendorName;
  final String? notes;
  final List<ScannedPage> pages;
  final IngestionStage stage;
  final DateTime createdAt;
  final String? errorMessage;

  const DocumentScanBatch({
    required this.id,
    required this.type,
    this.poReference,
    this.vendorName,
    this.notes,
    required this.pages,
    this.stage = IngestionStage.queued,
    required this.createdAt,
    this.errorMessage,
  });

  DocumentScanBatch copyWith({
    String? id,
    DocumentType? type,
    String? poReference,
    String? vendorName,
    String? notes,
    List<ScannedPage>? pages,
    IngestionStage? stage,
    DateTime? createdAt,
    String? errorMessage,
  }) {
    return DocumentScanBatch(
      id: id ?? this.id,
      type: type ?? this.type,
      poReference: poReference ?? this.poReference,
      vendorName: vendorName ?? this.vendorName,
      notes: notes ?? this.notes,
      pages: pages ?? this.pages,
      stage: stage ?? this.stage,
      createdAt: createdAt ?? this.createdAt,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

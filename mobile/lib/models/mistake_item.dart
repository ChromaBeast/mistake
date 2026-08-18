enum MistakeType {
  quantityMismatch,
  priceMismatch,
  dateMismatch,
  statusMismatch,
  missingEvidence,
}

extension MistakeTypeExtension on MistakeType {
  String get displayName {
    switch (this) {
      case MistakeType.quantityMismatch:
        return 'Quantity Mismatch';
      case MistakeType.priceMismatch:
        return 'Price Mismatch';
      case MistakeType.dateMismatch:
        return 'Delivery Delay / Date Mismatch';
      case MistakeType.statusMismatch:
        return 'Status Contradiction';
      case MistakeType.missingEvidence:
        return 'Missing Evidence / Orphan Doc';
    }
  }
}

enum MistakeSeverity {
  critical,
  high,
  medium,
  low,
  healthy,
}

enum MistakeStatus {
  detected,
  underReview,
  verified,
  resolved,
  dismissed,
}

enum MistakeDismissReason {
  expectedCommercialDiscount,
  volumeRebateApplied,
  vendorCredited,
  falsePositiveEntry,
  otherOperationalAdjustment,
}

extension MistakeDismissReasonExtension on MistakeDismissReason {
  String get label {
    switch (this) {
      case MistakeDismissReason.expectedCommercialDiscount:
        return 'Expected Commercial Discount';
      case MistakeDismissReason.volumeRebateApplied:
        return 'Volume Rebate Applied';
      case MistakeDismissReason.vendorCredited:
        return 'Vendor Issued Credit Note';
      case MistakeDismissReason.falsePositiveEntry:
        return 'False Positive Data Entry';
      case MistakeDismissReason.otherOperationalAdjustment:
        return 'Other Operational Adjustment';
    }
  }
}

class MistakeItem {
  final String id;
  final MistakeType type;
  final MistakeSeverity severity;
  final MistakeStatus status;
  final String title;
  final String description;
  final String entityName;
  final String? poReference;
  final String? invoiceReference;
  final int financialImpactMinor; // in paise
  final DateTime detectedAt;
  final String? assignedTo;
  final MistakeDismissReason? dismissReason;
  final String? resolutionNotes;
  final Map<String, dynamic> evidenceSummary;

  const MistakeItem({
    required this.id,
    required this.type,
    required this.severity,
    required this.status,
    required this.title,
    required this.description,
    required this.entityName,
    this.poReference,
    this.invoiceReference,
    required this.financialImpactMinor,
    required this.detectedAt,
    this.assignedTo,
    this.dismissReason,
    this.resolutionNotes,
    this.evidenceSummary = const {},
  });

  MistakeItem copyWith({
    String? id,
    MistakeType? type,
    MistakeSeverity? severity,
    MistakeStatus? status,
    String? title,
    String? description,
    String? entityName,
    String? poReference,
    String? invoiceReference,
    int? financialImpactMinor,
    DateTime? detectedAt,
    String? assignedTo,
    MistakeDismissReason? dismissReason,
    String? resolutionNotes,
    Map<String, dynamic>? evidenceSummary,
  }) {
    return MistakeItem(
      id: id ?? this.id,
      type: type ?? this.type,
      severity: severity ?? this.severity,
      status: status ?? this.status,
      title: title ?? this.title,
      description: description ?? this.description,
      entityName: entityName ?? this.entityName,
      poReference: poReference ?? this.poReference,
      invoiceReference: invoiceReference ?? this.invoiceReference,
      financialImpactMinor: financialImpactMinor ?? this.financialImpactMinor,
      detectedAt: detectedAt ?? this.detectedAt,
      assignedTo: assignedTo ?? this.assignedTo,
      dismissReason: dismissReason ?? this.dismissReason,
      resolutionNotes: resolutionNotes ?? this.resolutionNotes,
      evidenceSummary: evidenceSummary ?? this.evidenceSummary,
    );
  }
}

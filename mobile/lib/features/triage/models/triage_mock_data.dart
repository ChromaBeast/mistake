import '../../../models/mistake_item.dart';

class TriageMockData {
  static List<MistakeItem> get defaultDeck => [
    MistakeItem(
      id: 'mst-triage-1',
      type: MistakeType.quantityMismatch,
      severity: MistakeSeverity.critical,
      status: MistakeStatus.detected,
      title: '500 Units Shortage on Invoiced Shipment',
      description: 'PO #4091 for 5,000 Galvanized Pipes invoiced at full 5,500 quantity.',
      entityName: 'Tata Steel Tubes Division',
      poReference: 'PO-4091',
      invoiceReference: 'INV-8819',
      financialImpactMinor: 4750000,
      detectedAt: DateTime.now().subtract(const Duration(minutes: 30)),
      evidenceSummary: {'varianceUnits': 500, 'unitPriceMinor': 9500},
    ),
    MistakeItem(
      id: 'mst-triage-2',
      type: MistakeType.priceMismatch,
      severity: MistakeSeverity.high,
      status: MistakeStatus.underReview,
      title: 'Unit Price Surge: ₹320 vs Contracted ₹285',
      description: 'Alloy Aluminum Ingots billed ₹35/kg over agreed baseline pricing.',
      entityName: 'Hindalco Industries Ltd.',
      poReference: 'PO-3892',
      invoiceReference: 'INV-9021',
      financialImpactMinor: 3500000,
      detectedAt: DateTime.now().subtract(const Duration(hours: 1)),
      evidenceSummary: {'overchargePerKgPaise': 3500, 'totalQtyKg': 1000},
    ),
    MistakeItem(
      id: 'mst-triage-3',
      type: MistakeType.missingEvidence,
      severity: MistakeSeverity.critical,
      status: MistakeStatus.detected,
      title: 'Orphan Commercial Invoice (No PO Found)',
      description: 'Invoice billed to warehouse without matching signed Purchase Order.',
      entityName: 'Apex Logistics Corp',
      poReference: 'NONE',
      invoiceReference: 'INV-9942',
      financialImpactMinor: 6800000,
      detectedAt: DateTime.now().subtract(const Duration(hours: 3)),
    ),
  ];
}

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../models/mistake_item.dart';

class DashboardMetrics {
  final int totalLeakagePaise;
  final int protectedValuePaise;
  final int openMistakesCount;
  final int resolvedCount;
  final int documentsScannedToday;
  final List<MistakeItem> recentAlerts;

  const DashboardMetrics({
    required this.totalLeakagePaise,
    required this.protectedValuePaise,
    required this.openMistakesCount,
    required this.resolvedCount,
    required this.documentsScannedToday,
    required this.recentAlerts,
  });
}

class DashboardNotifier extends Notifier<DashboardMetrics> {
  @override
  DashboardMetrics build() {
    return DashboardMetrics(
      totalLeakagePaise: 14825000, // ₹1,48,250.00
      protectedValuePaise: 54600000, // ₹5,46,000.00
      openMistakesCount: 12,
      resolvedCount: 38,
      documentsScannedToday: 19,
      recentAlerts: [
        MistakeItem(
          id: 'mst-001',
          type: MistakeType.quantityMismatch,
          severity: MistakeSeverity.critical,
          status: MistakeStatus.detected,
          title: 'Quantity Mismatch: 500 Units Short',
          description: 'PO #4091 ordered 5,000 Galvanized Pipes, but Invoice #INV-8819 billed for 5,500 units.',
          entityName: 'Tata Steel Tubes Division',
          poReference: 'PO-4091',
          invoiceReference: 'INV-8819',
          financialImpactMinor: 4750000, // ₹47,500.00
          detectedAt: DateTime.now().subtract(const Duration(minutes: 18)),
          evidenceSummary: {
            'expectedQty': 5000,
            'billedQty': 5500,
            'unitPriceMinor': 9500,
          },
        ),
        MistakeItem(
          id: 'mst-002',
          type: MistakeType.priceMismatch,
          severity: MistakeSeverity.high,
          status: MistakeStatus.underReview,
          title: 'Price Spike: ₹320/kg vs Agreed ₹285/kg',
          description: 'Alloy Aluminum Ingots invoiced at ₹320.00/kg violating contracted master rate ₹285.00/kg.',
          entityName: 'Hindalco Industries Ltd.',
          poReference: 'PO-3892',
          invoiceReference: 'INV-9021',
          financialImpactMinor: 3500000, // ₹35,000.00
          detectedAt: DateTime.now().subtract(const Duration(hours: 2)),
          evidenceSummary: {
            'agreedPriceMinor': 28500,
            'billedPriceMinor': 32000,
            'quantity': 1000,
          },
        ),
        MistakeItem(
          id: 'mst-003',
          type: MistakeType.dateMismatch,
          severity: MistakeSeverity.medium,
          status: MistakeStatus.detected,
          title: 'Delivery Delay Penalties (14 Days)',
          description: 'Shipment arrived 14 days post delivery milestone without SLA waiver.',
          entityName: 'Jindal Saw Pipes',
          poReference: 'PO-3710',
          invoiceReference: 'INV-7640',
          financialImpactMinor: 1850000, // ₹18,500.00
          detectedAt: DateTime.now().subtract(const Duration(hours: 4)),
        ),
      ],
    );
  }

  void refresh() {
    // Refresh metrics simulation
    state = DashboardMetrics(
      totalLeakagePaise: state.totalLeakagePaise,
      protectedValuePaise: state.protectedValuePaise,
      openMistakesCount: state.openMistakesCount,
      resolvedCount: state.resolvedCount,
      documentsScannedToday: state.documentsScannedToday,
      recentAlerts: state.recentAlerts,
    );
  }
}

final dashboardProvider =
    NotifierProvider<DashboardNotifier, DashboardMetrics>(() {
  return DashboardNotifier();
});

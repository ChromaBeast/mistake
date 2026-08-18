import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/triage/widgets/triage_card.dart';
import 'package:mobile/models/mistake_item.dart';

void main() {
  group('TriageCard Widget', () {
    testWidgets('renders title, entity name, and leakage amount correctly', (tester) async {
      final mistake = MistakeItem(
        id: 'mst-test-01',
        type: MistakeType.quantityMismatch,
        severity: MistakeSeverity.critical,
        status: MistakeStatus.detected,
        title: '500 Units Shortage Detected',
        description: 'Test description of discrepancy for widget verification.',
        entityName: 'Test Steel Supplier Ltd',
        financialImpactMinor: 4750000, // ₹47,500.00
        detectedAt: DateTime(2026, 8, 18, 10, 30),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: TriageCard(item: mistake),
            ),
          ),
        ),
      );

      expect(find.text('500 Units Shortage Detected'), findsOneWidget);
      expect(find.text('Test Steel Supplier Ltd'), findsOneWidget);
      expect(find.text('₹47,500.00'), findsOneWidget);
      expect(find.text('CRITICAL'), findsOneWidget);
    });
  });
}

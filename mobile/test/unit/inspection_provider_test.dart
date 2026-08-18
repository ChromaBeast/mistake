import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/barcode_inspection/providers/inspection_provider.dart';
import 'package:mobile/models/inspection_item.dart';

void main() {
  group('InspectionNotifier Unit Tests', () {
    test('initial state loads default item', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final state = container.read(inspectionProvider);
      expect(state.isScanning, isFalse);
      expect(state.activeBarcode, 'EWAY-8849-2091-IN');
      expect(state.currentItem, isNotNull);
    });

    test('scanning barcode updates state and loads inspection item', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(inspectionProvider.notifier);
      notifier.scanCode('8901030384721');

      final state = container.read(inspectionProvider);
      expect(state.activeBarcode, '8901030384721');
      expect(state.currentItem, isNotNull);
      expect(state.isScanning, isFalse);
    });

    test('acceptShipment updates status and records history', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(inspectionProvider.notifier);
      notifier.acceptShipment();

      final state = container.read(inspectionProvider);
      expect(state.currentItem?.status, InspectionStatus.accepted);
      expect(state.inspectionHistory.length, 1);
    });

    test('flagDiscrepancy updates status to flagged with notes', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(inspectionProvider.notifier);
      notifier.flagDiscrepancy('Count mismatch observed');

      final state = container.read(inspectionProvider);
      expect(state.currentItem?.status, InspectionStatus.flagged);
      expect(state.currentItem?.inspectorNotes, 'Count mismatch observed');
    });
  });
}

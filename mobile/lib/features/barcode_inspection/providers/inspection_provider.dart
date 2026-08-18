import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/sync/sync_queue_item.dart';
import '../../../core/sync/sync_queue_notifier.dart';
import '../../../models/inspection_item.dart';
import '../models/inspection_mock_data.dart';

class InspectionState {
  final String activeBarcode;
  final InspectionItem? currentItem;
  final bool isScanning;
  final String? statusMessage;
  final List<InspectionItem> inspectionHistory;

  const InspectionState({
    this.activeBarcode = 'EWAY-8849-2091-IN',
    this.currentItem,
    this.isScanning = false,
    this.statusMessage,
    this.inspectionHistory = const [],
  });

  InspectionState copyWith({
    String? activeBarcode,
    InspectionItem? currentItem,
    bool? isScanning,
    String? statusMessage,
    List<InspectionItem>? inspectionHistory,
  }) {
    return InspectionState(
      activeBarcode: activeBarcode ?? this.activeBarcode,
      currentItem: currentItem ?? this.currentItem,
      isScanning: isScanning ?? this.isScanning,
      statusMessage: statusMessage ?? this.statusMessage,
      inspectionHistory: inspectionHistory ?? this.inspectionHistory,
    );
  }
}

/// Notifier that manages the barcode inspection state, updating UI status and current scanned item.
class InspectionNotifier extends Notifier<InspectionState> {
  @override
  InspectionState build() {
    final initialItem = InspectionMockData.lookupBarcode('EWAY-8849-2091-IN');
    return InspectionState(
      activeBarcode: 'EWAY-8849-2091-IN',
      currentItem: initialItem,
      statusMessage: 'Item loaded: ${initialItem.sku}',
    );
  }

  void scanCode(String barcode) {
    state = state.copyWith(activeBarcode: barcode, isScanning: true);

    final item = _lookupBarcode(barcode);
    state = state.copyWith(
      currentItem: item,
      isScanning: false,
      statusMessage: 'Item loaded: ${item.sku}',
    );
  }

  InspectionItem _lookupBarcode(String barcode) {
    return InspectionMockData.lookupBarcode(barcode);
  }

  void flagDiscrepancy(String note) {
    if (state.currentItem == null) return;
    final updated = state.currentItem!.copyWith(
      status: InspectionStatus.flagged,
      inspectorNotes: note,
    );
    _applyUpdate(updated, SyncActionType.flagInspection, 'Flagged Mismatch');
  }

  void acceptShipment() {
    if (state.currentItem == null) return;
    final updated = state.currentItem!.copyWith(status: InspectionStatus.accepted);
    _applyUpdate(updated, SyncActionType.acceptInspection, 'Accepted Shipment');
  }

  void escalateToManager(String note) {
    if (state.currentItem == null) return;
    final updated = state.currentItem!.copyWith(
      status: InspectionStatus.escalated,
      inspectorNotes: note,
    );
    _applyUpdate(updated, SyncActionType.escalateMistake, 'Escalated to Manager');
  }

  void attachPhotoEvidence(String uri) {
    if (state.currentItem == null) return;
    final updated = state.currentItem!.copyWith(attachedPhotoUri: uri);
    state = state.copyWith(
      currentItem: updated,
      statusMessage: 'Photo evidence attached to inspection.',
    );
  }

  void _applyUpdate(InspectionItem updated, SyncActionType syncType, String actionTitle) {
    state = state.copyWith(
      currentItem: updated,
      statusMessage: actionTitle,
      inspectionHistory: [updated, ...state.inspectionHistory],
    );

    ref.read(syncQueueProvider.notifier).enqueue(
      type: syncType,
      title: '$actionTitle: ${updated.sku} (${updated.poNumber})',
      payload: {
        'barcode': updated.barcode,
        'status': updated.status.name,
        'variancePaise': updated.varianceAmountMinor,
        'notes': updated.inspectorNotes,
      },
    );
  }
}

final inspectionProvider =
    NotifierProvider<InspectionNotifier, InspectionState>(() {
  return InspectionNotifier();
});

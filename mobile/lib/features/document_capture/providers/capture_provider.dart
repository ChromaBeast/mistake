import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import '../../../core/sync/sync_queue_item.dart';
import '../../../core/sync/sync_queue_notifier.dart';
import '../../../models/document_scan.dart';

class CaptureState {
  final DocumentType selectedDocType;
  final String? poReference;
  final String? vendorName;
  final List<ScannedPage> pages;
  final bool isFlashOn;
  final double ambientLux;
  final bool isUploading;
  final IngestionStage uploadStage;
  final String? lastUploadedBatchId;

  const CaptureState({
    this.selectedDocType = DocumentType.taxInvoice,
    this.poReference,
    this.vendorName,
    this.pages = const [],
    this.isFlashOn = false,
    this.ambientLux = 420.0,
    this.isUploading = false,
    this.uploadStage = IngestionStage.queued,
    this.lastUploadedBatchId,
  });

  bool get hasPages => pages.isNotEmpty;
  int get pageCount => pages.length;

  CaptureState copyWith({
    DocumentType? selectedDocType,
    String? poReference,
    String? vendorName,
    List<ScannedPage>? pages,
    bool? isFlashOn,
    double? ambientLux,
    bool? isUploading,
    IngestionStage? uploadStage,
    String? lastUploadedBatchId,
  }) {
    return CaptureState(
      selectedDocType: selectedDocType ?? this.selectedDocType,
      poReference: poReference ?? this.poReference,
      vendorName: vendorName ?? this.vendorName,
      pages: pages ?? this.pages,
      isFlashOn: isFlashOn ?? this.isFlashOn,
      ambientLux: ambientLux ?? this.ambientLux,
      isUploading: isUploading ?? this.isUploading,
      uploadStage: uploadStage ?? this.uploadStage,
      lastUploadedBatchId: lastUploadedBatchId ?? this.lastUploadedBatchId,
    );
  }
}

/// Notifier that manages the state of the document capture session, including pages scanned and current settings.
class CaptureNotifier extends Notifier<CaptureState> {
  static const _uuid = Uuid();

  @override
  CaptureState build() {
    return const CaptureState();
  }

  void setDocType(DocumentType type) => state = state.copyWith(selectedDocType: type);
  void setPoReference(String po) => state = state.copyWith(poReference: po);
  void setVendorName(String vendor) => state = state.copyWith(vendorName: vendor);
  void toggleFlash() => state = state.copyWith(isFlashOn: !state.isFlashOn);
  void setAmbientLux(double lux) => state = state.copyWith(ambientLux: lux);

  void capturePage() {
    final pageNumber = state.pages.length + 1;
    final newPage = ScannedPage(
      id: _uuid.v4(),
      pageNumber: pageNumber,
      capturedAt: DateTime.now(),
      ambientLux: state.ambientLux,
      detectedCorners: const [
        Offset(0.12, 0.15),
        Offset(0.88, 0.18),
        Offset(0.85, 0.82),
        Offset(0.15, 0.85),
      ],
    );

    state = state.copyWith(pages: [...state.pages, newPage]);
  }

  void removePage(String id) {
    final filtered = state.pages.where((p) => p.id != id).toList();
    final reindexed = List.generate(
      filtered.length,
      (i) => ScannedPage(
        id: filtered[i].id,
        pageNumber: i + 1,
        capturedAt: filtered[i].capturedAt,
        detectedCorners: filtered[i].detectedCorners,
        ambientLux: filtered[i].ambientLux,
      ),
    );
    state = state.copyWith(pages: reindexed);
  }

  void clearSession() {
    state = CaptureState(selectedDocType: state.selectedDocType);
  }

  Future<void> submitBatch() async {
    if (state.pages.isEmpty) return;

    try {
      final batchId = 'BATCH-${DateTime.now().millisecondsSinceEpoch.toString().substring(6)}';
      state = state.copyWith(
        isUploading: true,
        uploadStage: IngestionStage.queued,
        lastUploadedBatchId: batchId,
      );

      // Queue in offline sync system
      ref.read(syncQueueProvider.notifier).enqueue(
        type: SyncActionType.uploadDocument,
        title: '${state.selectedDocType.displayName} (${state.pages.length} Pages)',
        payload: {
          'batchId': batchId,
          'docType': state.selectedDocType.name,
          'poReference': state.poReference,
          'pageCount': state.pages.length,
        },
      );

      // Run 5-stage ingestion state machine animation
      await Future.delayed(const Duration(milliseconds: 600));
      state = state.copyWith(uploadStage: IngestionStage.processing);
      await Future.delayed(const Duration(milliseconds: 700));
      state = state.copyWith(uploadStage: IngestionStage.extracting);
      await Future.delayed(const Duration(milliseconds: 800));
      state = state.copyWith(uploadStage: IngestionStage.analyzing);
      await Future.delayed(const Duration(milliseconds: 600));
      state = state.copyWith(uploadStage: IngestionStage.completed);
    } catch (e) {
      state = state.copyWith(
        isUploading: false,
      );
    }
  }

  void dismissUploadSheet() {
    state = state.copyWith(isUploading: false, pages: []);
  }
}

final captureProvider =
    NotifierProvider<CaptureNotifier, CaptureState>(() {
  return CaptureNotifier();
});

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../core/constants/app_strings.dart';
import '../../../shared/components/app_header.dart';
import '../providers/inspection_provider.dart';
import '../widgets/discrepancy_preview_card.dart';
import '../widgets/inspection_actions_bar.dart';
import '../widgets/laser_scanner_overlay.dart';
import '../widgets/scan_preset_selector.dart';

/// Screen that handles the barcode scanning and inspection process for verifying goods.
class InspectionScreen extends ConsumerWidget {
  const InspectionScreen({super.key});

  void _showNoteDialog(
    BuildContext context,
    String title,
    ValueChanged<String> onSubmit,
  ) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surfaceDark,
        title: Text(title, style: const TextStyle(fontSize: 16, color: Colors.white)),
        content: TextField(
          controller: controller,
          maxLines: 3,
          style: const TextStyle(color: Colors.white, fontSize: 13),
          decoration: const InputDecoration(
            hintText: 'Enter reason or floor notes...',
            hintStyle: TextStyle(color: AppColors.textMutedDark),
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              onSubmit(controller.text);
            },
            child: const Text('Confirm'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(inspectionProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      body: Column(
        children: [
          AppHeader(
            title: AppStrings.titleInspection,
            subtitle: AppStrings.scanningTitle,
            actions: [
              IconButton(
                icon: const Icon(Icons.qr_code, size: 20),
                onPressed: () => ref.read(inspectionProvider.notifier).scanCode('EWAY-8849-2091-IN'),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.p8),
          ScanPresetSelector(
            selectedBarcode: state.activeBarcode,
            onSelectPreset: ref.read(inspectionProvider.notifier).scanCode,
          ),
          const SizedBox(height: AppDimensions.p8),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: AppDimensions.p16),
              child: Column(
                children: [
                  LaserScannerOverlay(
                    isScanning: state.isScanning,
                    hasDiscrepancy: state.currentItem?.hasVariance ?? false,
                  ),
                  const SizedBox(height: AppDimensions.p16),
                  if (state.currentItem != null)
                    DiscrepancyPreviewCard(item: state.currentItem!),
                ],
              ),
            ),
          ),
          InspectionActionsBar(
            onFlag: () => _showNoteDialog(
              context,
              'Flag Shipment Discrepancy',
              (note) => ref.read(inspectionProvider.notifier).flagDiscrepancy(note.isEmpty ? 'Shortage on floor' : note),
            ),
            onAccept: () {
              ref.read(inspectionProvider.notifier).acceptShipment();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Shipment successfully marked as Accepted.')),
              );
            },
            onEscalate: () => _showNoteDialog(
              context,
              'Escalate to Operations Manager',
              (note) => ref.read(inspectionProvider.notifier).escalateToManager(note.isEmpty ? 'Price variance escalation' : note),
            ),
            onAttachPhoto: () {
              ref.read(inspectionProvider.notifier).attachPhotoEvidence('simulated://photo/evidence_01.jpg');
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Photo attached to inspection record.')),
              );
            },
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../core/constants/app_strings.dart';
import '../../../models/document_scan.dart';
import '../../../shared/components/app_button.dart';
import '../../../shared/components/app_header.dart';
import '../providers/capture_provider.dart';
import '../widgets/camera_viewfinder.dart';
import '../widgets/page_thumbnail_tray.dart';
import '../widgets/upload_progress_sheet.dart';

/// Screen responsible for displaying the camera interface to scan and capture documents.
class CameraScannerScreen extends ConsumerWidget {
  const CameraScannerScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(captureProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      body: Column(
        children: [
          AppHeader(
            title: AppStrings.titleCapture,
            subtitle: AppStrings.documentCaptureTitle,
            actions: [
              if (state.hasPages)
                TextButton(
                  onPressed: () => ref.read(captureProvider.notifier).clearSession(),
                  child: const Text('Reset', style: TextStyle(color: AppColors.danger, fontSize: 13)),
                ),
            ],
          ),
          // Doc type selector ribbon
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppDimensions.p16,
              vertical: AppDimensions.p8,
            ),
            color: AppColors.surfaceDark,
            child: Row(
              children: [
                const Icon(Icons.tune, size: 16, color: AppColors.textSecondaryDark),
                const SizedBox(width: AppDimensions.p8),
                Expanded(
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<DocumentType>(
                      value: state.selectedDocType,
                      isExpanded: true,
                      dropdownColor: AppColors.surfaceDark,
                      items: DocumentType.values.map((type) {
                        return DropdownMenuItem(
                          value: type,
                          child: Text(
                            type.displayName,
                            style: const TextStyle(fontSize: 13, color: Colors.white),
                          ),
                        );
                      }).toList(),
                      onChanged: (type) {
                        if (type != null) ref.read(captureProvider.notifier).setDocType(type);
                      },
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Interactive Viewfinder
          Expanded(
            child: CameraViewfinder(
              ambientLux: state.ambientLux,
              isFlashOn: state.isFlashOn,
              onToggleFlash: ref.read(captureProvider.notifier).toggleFlash,
              onCapture: ref.read(captureProvider.notifier).capturePage,
              capturedPageCount: state.pageCount,
            ),
          ),
          // Page Thumbnail Tray
          if (state.hasPages)
            PageThumbnailTray(
              pages: state.pages,
              onRemovePage: ref.read(captureProvider.notifier).removePage,
              onAddPage: ref.read(captureProvider.notifier).capturePage,
            ),
          // Bottom Submission Bar
          Container(
            padding: const EdgeInsets.all(AppDimensions.p16),
            color: AppColors.surfaceDark,
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          '${state.pageCount} PAGE(S) READY',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textSecondaryDark,
                          ),
                        ),
                        Text(
                          state.selectedDocType.displayName,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  AppButton(
                    label: 'Process Batch →',
                    variant: ButtonVariant.primary,
                    onPressed: state.hasPages
                        ? () {
                            ref.read(captureProvider.notifier).submitBatch();
                            showModalBottomSheet(
                              context: context,
                              isDismissible: false,
                              enableDrag: false,
                              builder: (_) => Consumer(
                                builder: (ctx, ref, _) {
                                  final s = ref.watch(captureProvider);
                                  return UploadProgressSheet(
                                    stage: s.uploadStage,
                                    batchId: s.lastUploadedBatchId,
                                    pageCount: s.pageCount,
                                    onDismiss: () {
                                      Navigator.of(ctx).pop();
                                      ref.read(captureProvider.notifier).dismissUploadSheet();
                                    },
                                  );
                                },
                              ),
                            );
                          }
                        : null,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

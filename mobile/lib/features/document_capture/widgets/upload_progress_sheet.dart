import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../models/document_scan.dart';
import '../../../shared/components/app_button.dart';

class UploadProgressSheet extends StatelessWidget {
  final IngestionStage stage;
  final String? batchId;
  final int pageCount;
  final VoidCallback onDismiss;

  const UploadProgressSheet({
    super.key,
    required this.stage,
    this.batchId,
    required this.pageCount,
    required this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    final isDone = stage == IngestionStage.completed;
    final isFailed = stage == IngestionStage.failed;

    return Container(
      padding: const EdgeInsets.all(AppDimensions.p24),
      decoration: const BoxDecoration(
        color: AppColors.surfaceDark,
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppDimensions.radiusLg)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                isDone ? 'DOCUMENT PROCESSED' : 'INGESTING BATCH',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                  color: AppColors.textPrimaryDark,
                ),
              ),
              if (batchId != null)
                Text(
                  batchId!,
                  style: const TextStyle(
                    fontSize: 11,
                    fontFamily: 'monospace',
                    color: AppColors.textSecondaryDark,
                  ),
                ),
            ],
          ),
          const SizedBox(height: AppDimensions.p16),
          LinearProgressIndicator(
            value: stage.progressValue,
            backgroundColor: AppColors.surfaceElevated,
            valueColor: AlwaysStoppedAnimation<Color>(
              isDone ? AppColors.success : (isFailed ? AppColors.danger : AppColors.primary),
            ),
            minHeight: 8,
            borderRadius: BorderRadius.circular(4),
          ),
          const SizedBox(height: AppDimensions.p16),
          _StageChecklistItem(
            title: 'Batch Queued & Offline Logged',
            isComplete: stage.index >= IngestionStage.queued.index,
            isActive: stage == IngestionStage.queued,
          ),
          _StageChecklistItem(
            title: 'Image Preprocessing & Edge Straightening ($pageCount Pages)',
            isComplete: stage.index >= IngestionStage.processing.index,
            isActive: stage == IngestionStage.processing,
          ),
          _StageChecklistItem(
            title: 'Fact Extraction & Table Parsing',
            isComplete: stage.index >= IngestionStage.extracting.index,
            isActive: stage == IngestionStage.extracting,
          ),
          _StageChecklistItem(
            title: 'Deterministic Discrepancy Cross-Check',
            isComplete: stage.index >= IngestionStage.analyzing.index,
            isActive: stage == IngestionStage.analyzing,
          ),
          _StageChecklistItem(
            title: 'Evidence Ready in Investigation Hub',
            isComplete: stage == IngestionStage.completed,
            isActive: stage == IngestionStage.completed,
          ),
          const SizedBox(height: AppDimensions.p24),
          if (isDone || isFailed)
            AppButton(
              label: isDone ? 'Done & Return to Scanner' : 'Dismiss',
              variant: isDone ? ButtonVariant.primary : ButtonVariant.secondary,
              onPressed: onDismiss,
            ),
        ],
      ),
    );
  }
}

class _StageChecklistItem extends StatelessWidget {
  final String title;
  final bool isComplete;
  final bool isActive;

  const _StageChecklistItem({
    required this.title,
    required this.isComplete,
    required this.isActive,
  });

  @override
  Widget build(BuildContext context) {
    Color iconColor = AppColors.textMutedDark;
    IconData icon = Icons.radio_button_unchecked;

    if (isComplete && !isActive) {
      iconColor = AppColors.success;
      icon = Icons.check_circle;
    } else if (isActive) {
      iconColor = AppColors.primary;
      icon = Icons.arrow_circle_right;
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 16, color: iconColor),
          const SizedBox(width: AppDimensions.p8),
          Expanded(
            child: Text(
              title,
              style: TextStyle(
                fontSize: 12,
                color: isComplete || isActive ? AppColors.textPrimaryDark : AppColors.textMutedDark,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w400,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

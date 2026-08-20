import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../models/mistake_item.dart';
import '../../../shared/components/app_card.dart';
import '../../../shared/components/financial_metric_chip.dart';
import '../../../shared/components/severity_indicator_pill.dart';
import 'mistake_feedback_bar.dart';

class TriageCard extends StatelessWidget {
  final MistakeItem item;

  const TriageCard({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AppCard(
      padding: const EdgeInsets.all(AppDimensions.p20),
      borderColor: AppColors.primary.withValues(alpha: 0.4),
      backgroundColor: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              SeverityIndicatorPill(severity: item.severity),
              Text(
                DateFormatter.formatRelative(item.detectedAt),
                style: const TextStyle(fontSize: 12, color: AppColors.textMutedDark),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.p12),
          Text(
            item.title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.4,
            ),
          ),
          const SizedBox(height: AppDimensions.p8),
          Text(
            item.description,
            style: TextStyle(
              fontSize: 13,
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              height: 1.4,
            ),
          ),
          const SizedBox(height: AppDimensions.p16),
          Container(
            padding: const EdgeInsets.all(AppDimensions.p12),
            decoration: BoxDecoration(
              color: isDark ? AppColors.surfaceElevated : AppColors.borderLight,
              borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'COUNTERPARTY',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.textMutedDark),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      item.entityName,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primary),
                    ),
                  ],
                ),
                FinancialMetricChip(
                  amountPaise: item.financialImpactMinor,
                  type: FinancialMetricType.leakage,
                  label: 'LEAKAGE',
                ),
              ],
            ),
          ),
          const SizedBox(height: AppDimensions.p12),
          Row(
            children: [
              if (item.poReference != null)
                _RefPill(label: 'PO', value: item.poReference!),
              if (item.invoiceReference != null) ...[
                const SizedBox(width: AppDimensions.p8),
                _RefPill(label: 'INV', value: item.invoiceReference!),
              ],
            ],
          ),
          const SizedBox(height: AppDimensions.p12),
          MistakeFeedbackBar(mistakeId: item.id),
        ],
      ),
    );
  }
}

class _RefPill extends StatelessWidget {
  final String label;
  final String value;

  const _RefPill({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(AppDimensions.radiusXs),
      ),
      child: Text(
        '$label: $value',
        style: const TextStyle(fontSize: 11, fontFamily: 'monospace', color: AppColors.textSecondaryDark),
      ),
    );
  }
}

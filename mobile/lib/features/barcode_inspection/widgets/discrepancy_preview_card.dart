import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/constants/app_strings.dart';
import '../../../models/inspection_item.dart';
import '../../../shared/components/app_badge.dart';
import '../../../shared/components/app_card.dart';
import '../../../shared/components/financial_metric_chip.dart';
import 'comparison_column.dart';

class DiscrepancyPreviewCard extends StatelessWidget {
  final InspectionItem item;

  const DiscrepancyPreviewCard({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isClean = item.discrepancyType == InspectionDiscrepancyType.perfectMatch;

    return AppCard(
      padding: const EdgeInsets.all(AppDimensions.p16),
      borderColor: isClean
          ? AppColors.success.withValues(alpha: 0.5)
          : AppColors.danger.withValues(alpha: 0.5),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              AppBadge(
                label: item.barcodeType,
                variant: isClean ? BadgeVariant.success : BadgeVariant.danger,
              ),
              if (item.hasVariance)
                FinancialMetricChip(
                  amountPaise: item.varianceAmountMinor,
                  type: FinancialMetricType.leakage,
                  label: AppStrings.variance,
                )
              else
                const AppBadge(label: AppStrings.verifiedZeroLeakage, variant: BadgeVariant.success),
            ],
          ),
          const SizedBox(height: AppDimensions.p12),
          Text(
            item.sku,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              fontFamily: 'monospace',
            ),
          ),
          const SizedBox(height: 2),
          Text(
            item.description,
            style: TextStyle(
              fontSize: 12,
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            ),
          ),
          const SizedBox(height: AppDimensions.p12),
          const Divider(),
          const SizedBox(height: AppDimensions.p8),
          // Side-by-side comparison table
          Row(
            children: [
              Expanded(
                child: ComparisonColumn(
                  title: AppStrings.purchaseOrder,
                  sub: item.poNumber,
                  qty: '${item.expectedQuantity} units',
                  price: CurrencyFormatter.formatPaise(item.unitPriceMinor),
                ),
              ),
              Container(width: 1, height: 50, color: AppColors.borderDark.withValues(alpha: 0.4)),
              Expanded(
                child: ComparisonColumn(
                  title: AppStrings.receivedOnFloor,
                  sub: item.invoiceNumber,
                  qty: '${item.receivedQuantity} units',
                  price: CurrencyFormatter.formatPaise(item.unitPriceMinor),
                  isMismatch: item.expectedQuantity != item.receivedQuantity,
                ),
              ),
            ],
          ),
          if (item.inspectorNotes != null) ...[
            const SizedBox(height: AppDimensions.p8),
            Text(
              'Note: ${item.inspectorNotes}',
              style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: AppColors.warning),
            ),
          ],
        ],
      ),
    );
  }
}

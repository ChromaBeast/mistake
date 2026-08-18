import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';

class ComparisonColumn extends StatelessWidget {
  final String title;
  final String sub;
  final String qty;
  final String price;
  final bool isMismatch;

  const ComparisonColumn({
    super.key,
    required this.title,
    required this.sub,
    required this.qty,
    required this.price,
    this.isMismatch = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppDimensions.p8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: AppColors.textMutedDark),
          ),
          Text(sub, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primary)),
          const SizedBox(height: 4),
          Text(
            qty,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: isMismatch ? AppColors.danger : AppColors.textPrimaryDark,
            ),
          ),
          Text(
            '@ $price/unit',
            style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryDark),
          ),
        ],
      ),
    );
  }
}

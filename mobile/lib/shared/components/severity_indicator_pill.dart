import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../models/mistake_item.dart';

class SeverityIndicatorPill extends StatelessWidget {
  final MistakeSeverity severity;
  final bool showIcon;

  const SeverityIndicatorPill({
    super.key,
    required this.severity,
    this.showIcon = true,
  });

  Color _getColor() {
    switch (severity) {
      case MistakeSeverity.critical:
        return AppColors.danger;
      case MistakeSeverity.high:
        return const Color(0xFFFB923C); // Orange 400
      case MistakeSeverity.medium:
        return AppColors.warning;
      case MistakeSeverity.low:
        return AppColors.info;
      case MistakeSeverity.healthy:
        return AppColors.success;
    }
  }

  IconData _getIcon() {
    switch (severity) {
      case MistakeSeverity.critical:
        return Icons.dangerous_rounded;
      case MistakeSeverity.high:
        return Icons.warning_rounded;
      case MistakeSeverity.medium:
        return Icons.error_outline_rounded;
      case MistakeSeverity.low:
        return Icons.info_outline_rounded;
      case MistakeSeverity.healthy:
        return Icons.check_circle_outline_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _getColor();
    final name = severity.name.toUpperCase();

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.p8,
        vertical: AppDimensions.p4,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(AppDimensions.radiusFull),
        border: Border.all(color: color.withValues(alpha: 0.35), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showIcon) ...[
            Icon(_getIcon(), size: 12, color: color),
            const SizedBox(width: AppDimensions.p4),
          ],
          Text(
            name,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

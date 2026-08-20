import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';

enum MistakeFeedbackType { accurate, notAccurate, notSure }

class MistakeFeedbackBar extends StatefulWidget {
  final String mistakeId;
  final ValueChanged<MistakeFeedbackType>? onFeedback;

  const MistakeFeedbackBar({
    super.key,
    required this.mistakeId,
    this.onFeedback,
  });

  @override
  State<MistakeFeedbackBar> createState() => _MistakeFeedbackBarState();
}

class _MistakeFeedbackBarState extends State<MistakeFeedbackBar> {
  MistakeFeedbackType? _selected;

  void _handleSelect(MistakeFeedbackType type) {
    setState(() => _selected = type);
    widget.onFeedback?.call(type);
  }

  @override
  Widget build(BuildContext context) {
    if (_selected != null) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: AppColors.success.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
          border: Border.all(color: AppColors.success.withValues(alpha: 0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle_outline, size: 14, color: AppColors.success),
            const SizedBox(width: 6),
            Text(
              'Feedback: ${_selected!.name}',
              style: const TextStyle(fontSize: 11, color: AppColors.success, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(AppDimensions.p4),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
        border: Border.all(color: AppColors.borderDark.withValues(alpha: 0.5)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 6),
            child: Text(
              'Accuracy:',
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.textMutedDark),
            ),
          ),
          _FeedbackButton(
            icon: Icons.thumb_up_alt_outlined,
            label: 'Accurate',
            color: AppColors.success,
            onTap: () => _handleSelect(MistakeFeedbackType.accurate),
          ),
          const SizedBox(width: 4),
          _FeedbackButton(
            icon: Icons.thumb_down_alt_outlined,
            label: 'Wrong',
            color: AppColors.danger,
            onTap: () => _handleSelect(MistakeFeedbackType.notAccurate),
          ),
          const SizedBox(width: 4),
          _FeedbackButton(
            icon: Icons.help_outline,
            label: 'Not Sure',
            color: AppColors.warning,
            onTap: () => _handleSelect(MistakeFeedbackType.notSure),
          ),
        ],
      ),
    );
  }
}

class _FeedbackButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _FeedbackButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppDimensions.radiusXs),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 12, color: color),
            const SizedBox(width: 3),
            Text(
              label,
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color),
            ),
          ],
        ),
      ),
    );
  }
}

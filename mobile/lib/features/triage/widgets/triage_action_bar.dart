import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';

class TriageActionBar extends StatelessWidget {
  final VoidCallback onDismiss;
  final VoidCallback onEscalate;
  final VoidCallback onVerify;

  const TriageActionBar({
    super.key,
    required this.onDismiss,
    required this.onEscalate,
    required this.onVerify,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.p24,
        vertical: AppDimensions.p16,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _CircleActionButton(
            icon: Icons.close_rounded,
            color: AppColors.danger,
            size: 54,
            label: 'Dismiss',
            onTap: onDismiss,
          ),
          _CircleActionButton(
            icon: Icons.arrow_upward_rounded,
            color: AppColors.warning,
            size: 46,
            label: 'Escalate',
            onTap: onEscalate,
          ),
          _CircleActionButton(
            icon: Icons.check_rounded,
            color: AppColors.success,
            size: 54,
            label: 'Verify',
            onTap: onVerify,
          ),
        ],
      ),
    );
  }
}

class _CircleActionButton extends StatelessWidget {
  final IconData icon;
  final Color color;
  final double size;
  final String label;
  final VoidCallback onTap;

  const _CircleActionButton({
    required this.icon,
    required this.color,
    required this.size,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        GestureDetector(
          onTap: onTap,
          child: Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              shape: BoxShape.circle,
              border: Border.all(color: color.withValues(alpha: 0.5), width: 1.5),
            ),
            child: Icon(icon, color: color, size: size * 0.5),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: color,
          ),
        ),
      ],
    );
  }
}

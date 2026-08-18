import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';

class LightingIndicator extends StatelessWidget {
  final double ambientLux;
  final bool isFlashOn;
  final VoidCallback onToggleFlash;

  const LightingIndicator({
    super.key,
    required this.ambientLux,
    required this.isFlashOn,
    required this.onToggleFlash,
  });

  String get _statusLabel {
    if (ambientLux < 150) return 'Too Dark (Turn Flash On)';
    if (ambientLux > 850) return 'Potential Glare';
    return 'Optimal Lighting';
  }

  Color get _statusColor {
    if (ambientLux < 150) return AppColors.luxDark;
    if (ambientLux > 850) return AppColors.luxGlare;
    return AppColors.luxOptimal;
  }

  @override
  Widget build(BuildContext context) {
    final color = _statusColor;

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.p12,
        vertical: AppDimensions.p6,
      ),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.65),
        borderRadius: BorderRadius.circular(AppDimensions.radiusFull),
        border: Border.all(color: color.withValues(alpha: 0.5)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: AppDimensions.p8),
          Text(
            '${ambientLux.toInt()} lx • $_statusLabel',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: AppDimensions.p8),
          GestureDetector(
            onTap: onToggleFlash,
            child: Icon(
              isFlashOn ? Icons.flash_on_rounded : Icons.flash_off_rounded,
              color: isFlashOn ? AppColors.warning : Colors.white70,
              size: 16,
            ),
          ),
        ],
      ),
    );
  }
}

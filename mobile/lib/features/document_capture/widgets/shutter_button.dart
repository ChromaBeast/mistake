import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class ShutterButton extends StatelessWidget {
  final VoidCallback onTap;
  final int pageCount;

  const ShutterButton({super.key, required this.onTap, required this.pageCount});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 72,
        height: 72,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 4),
          color: Colors.white.withValues(alpha: 0.2),
        ),
        child: Center(
          child: Container(
            width: 54,
            height: 54,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white,
            ),
            child: Center(
              child: Text(
                pageCount > 0 ? '$pageCount' : '',
                style: const TextStyle(
                  color: AppColors.backgroundDark,
                  fontWeight: FontWeight.w900,
                  fontSize: 16,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

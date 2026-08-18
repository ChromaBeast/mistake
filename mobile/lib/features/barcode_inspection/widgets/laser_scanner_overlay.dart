import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';

class LaserScannerOverlay extends StatefulWidget {
  final bool isScanning;
  final bool hasDiscrepancy;

  const LaserScannerOverlay({
    super.key,
    this.isScanning = true,
    this.hasDiscrepancy = false,
  });

  @override
  State<LaserScannerOverlay> createState() => _LaserScannerOverlayState();
}

class _LaserScannerOverlayState extends State<LaserScannerOverlay>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final laserColor = widget.hasDiscrepancy ? AppColors.scannerLaser : AppColors.luxOptimal;

    return Center(
      child: Container(
        width: 280,
        height: 180,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
          border: Border.all(
            color: laserColor.withValues(alpha: 0.4),
            width: 1.5,
          ),
          color: Colors.black.withValues(alpha: 0.3),
        ),
        child: Stack(
          children: [
            // Corner Reticles
            ..._buildCornerMarkers(laserColor),
            // Sweeping Laser Beam
            AnimatedBuilder(
              animation: _animController,
              builder: (context, _) {
                return Positioned(
                  top: 10 + (_animController.value * 155),
                  left: 8,
                  right: 8,
                  child: Container(
                    height: 2.5,
                    decoration: BoxDecoration(
                      color: laserColor,
                      boxShadow: [
                        BoxShadow(
                          color: laserColor.withValues(alpha: 0.8),
                          blurRadius: 8,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildCornerMarkers(Color color) {
    const size = 16.0;
    const stroke = 3.0;

    return [
      // Top Left
      Positioned(
        top: 0,
        left: 0,
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            border: Border(
              top: BorderSide(color: color, width: stroke),
              left: BorderSide(color: color, width: stroke),
            ),
          ),
        ),
      ),
      // Top Right
      Positioned(
        top: 0,
        right: 0,
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            border: Border(
              top: BorderSide(color: color, width: stroke),
              right: BorderSide(color: color, width: stroke),
            ),
          ),
        ),
      ),
      // Bottom Left
      Positioned(
        bottom: 0,
        left: 0,
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(color: color, width: stroke),
              left: BorderSide(color: color, width: stroke),
            ),
          ),
        ),
      ),
      // Bottom Right
      Positioned(
        bottom: 0,
        right: 0,
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(color: color, width: stroke),
              right: BorderSide(color: color, width: stroke),
            ),
          ),
        ),
      ),
    ];
  }
}

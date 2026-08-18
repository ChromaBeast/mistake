import 'package:flutter/material.dart';
import '../../../core/constants/app_dimensions.dart';
import 'edge_overlay_painter.dart';
import 'lighting_indicator.dart';
import 'shutter_button.dart';

class CameraViewfinder extends StatefulWidget {
  final double ambientLux;
  final bool isFlashOn;
  final VoidCallback onToggleFlash;
  final VoidCallback onCapture;
  final int capturedPageCount;

  const CameraViewfinder({
    super.key,
    required this.ambientLux,
    required this.isFlashOn,
    required this.onToggleFlash,
    required this.onCapture,
    required this.capturedPageCount,
  });

  @override
  State<CameraViewfinder> createState() => _CameraViewfinderState();
}

class _CameraViewfinderState extends State<CameraViewfinder>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        // Camera sensor simulation dark background
        Container(
          color: const Color(0xFF090D16),
          child: Center(
            child: Icon(
              Icons.receipt_long_rounded,
              size: 160,
              color: Colors.white.withValues(alpha: 0.04),
            ),
          ),
        ),
        // Live Edge Detection Quad Overlay
        AnimatedBuilder(
          animation: _animController,
          builder: (context, _) {
            return CustomPaint(
              painter: EdgeOverlayPainter(
                normalizedCorners: const [
                  Offset(0.12, 0.18),
                  Offset(0.88, 0.15),
                  Offset(0.85, 0.78),
                  Offset(0.15, 0.82),
                ],
                animationProgress: 0.8 + (_animController.value * 0.2),
              ),
            );
          },
        ),
        // Top Lighting & Lux Meter
        Positioned(
          top: AppDimensions.p16,
          left: 0,
          right: 0,
          child: Center(
            child: LightingIndicator(
              ambientLux: widget.ambientLux,
              isFlashOn: widget.isFlashOn,
              onToggleFlash: widget.onToggleFlash,
            ),
          ),
        ),
        // Shutter Button Bar
        Positioned(
          bottom: AppDimensions.p16,
          left: 0,
          right: 0,
          child: Center(
            child: ShutterButton(
              onTap: widget.onCapture,
              pageCount: widget.capturedPageCount,
            ),
          ),
        ),
      ],
    );
  }
}

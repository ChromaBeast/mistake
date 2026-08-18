import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class EdgeOverlayPainter extends CustomPainter {
  final List<Offset> normalizedCorners;
  final double animationProgress;
  final Color strokeColor;

  const EdgeOverlayPainter({
    required this.normalizedCorners,
    this.animationProgress = 1.0,
    this.strokeColor = AppColors.scannerBoxCorner,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (normalizedCorners.length < 4) return;

    final points = normalizedCorners.map((p) {
      return Offset(p.dx * size.width, p.dy * size.height);
    }).toList();

    // Semi-transparent quad fill
    final fillPaint = Paint()
      ..color = strokeColor.withValues(alpha: 0.12 * animationProgress)
      ..style = PaintingStyle.fill;

    final path = Path()
      ..moveTo(points[0].dx, points[0].dy)
      ..lineTo(points[1].dx, points[1].dy)
      ..lineTo(points[2].dx, points[2].dy)
      ..lineTo(points[3].dx, points[3].dy)
      ..close();

    canvas.drawPath(path, fillPaint);

    // Quad border stroke
    final strokePaint = Paint()
      ..color = strokeColor.withValues(alpha: 0.85)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    canvas.drawPath(path, strokePaint);

    // Draw prominent corner targets
    final cornerPaint = Paint()
      ..color = strokeColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.5;

    for (final pt in points) {
      canvas.drawCircle(pt, 6, cornerPaint);
      canvas.drawCircle(
        pt,
        10 * animationProgress,
        Paint()
          ..color = strokeColor.withValues(alpha: 0.4 * (1.0 - animationProgress + 0.2))
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.5,
      );
    }
  }

  @override
  bool shouldRepaint(covariant EdgeOverlayPainter oldDelegate) {
    return oldDelegate.animationProgress != animationProgress ||
        oldDelegate.normalizedCorners != normalizedCorners ||
        oldDelegate.strokeColor != strokeColor;
  }
}

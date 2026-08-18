import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/document_capture/widgets/edge_overlay_painter.dart';

void main() {
  group('EdgeOverlayPainter', () {
    testWidgets('renders edge overlay on canvas without exceptions', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: SizedBox(
                width: 300,
                height: 400,
                child: CustomPaint(
                  painter: EdgeOverlayPainter(
                    normalizedCorners: [
                      Offset(0.1, 0.1),
                      Offset(0.9, 0.1),
                      Offset(0.9, 0.9),
                      Offset(0.1, 0.9),
                    ],
                    animationProgress: 1.0,
                  ),
                ),
              ),
            ),
          ),
        ),
      );

      final customPaintFinder = find.byWidgetPredicate(
        (widget) => widget is CustomPaint && widget.painter is EdgeOverlayPainter,
      );
      expect(customPaintFinder, findsOneWidget);
    });
  });
}

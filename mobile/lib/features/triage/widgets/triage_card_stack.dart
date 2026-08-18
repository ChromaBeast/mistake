import 'dart:math';
import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../models/mistake_item.dart';
import 'triage_card.dart';

class TriageCardStack extends StatefulWidget {
  final List<MistakeItem> cards;
  final VoidCallback onSwipeRight;
  final VoidCallback onSwipeLeft;
  final VoidCallback onSwipeUp;

  const TriageCardStack({
    super.key,
    required this.cards,
    required this.onSwipeRight,
    required this.onSwipeLeft,
    required this.onSwipeUp,
  });

  @override
  State<TriageCardStack> createState() => _TriageCardStackState();
}

class _TriageCardStackState extends State<TriageCardStack> {
  Offset _dragOffset = Offset.zero;

  @override
  Widget build(BuildContext context) {
    if (widget.cards.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.check_circle_outline_rounded, size: 64, color: AppColors.success.withValues(alpha: 0.8)),
            const SizedBox(height: 16),
            const Text(
              'All High-Priority Leaks Triaged!',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white),
            ),
            const SizedBox(height: 8),
            const Text(
              'Great work. Check back as floor scans stream in.',
              style: TextStyle(fontSize: 13, color: AppColors.textSecondaryDark),
            ),
          ],
        ),
      );
    }

    final topItem = widget.cards.first;
    final double rotation = (_dragOffset.dx / 300) * (pi / 12);

    return Center(
      child: GestureDetector(
        onPanUpdate: (details) {
          setState(() {
            _dragOffset += details.delta;
          });
        },
        onPanEnd: (details) {
          if (_dragOffset.dx > 120) {
            widget.onSwipeRight();
          } else if (_dragOffset.dx < -120) {
            widget.onSwipeLeft();
          } else if (_dragOffset.dy < -120) {
            widget.onSwipeUp();
          }
          setState(() {
            _dragOffset = Offset.zero;
          });
        },
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Background stacked card preview
            if (widget.cards.length > 1)
              Transform.scale(
                scale: 0.95,
                child: Opacity(
                  opacity: 0.6,
                  child: TriageCard(item: widget.cards[1]),
                ),
              ),
            // Foreground swipable card
            Transform.translate(
              offset: _dragOffset,
              child: Transform.rotate(
                angle: rotation,
                child: Stack(
                  children: [
                    TriageCard(item: topItem),
                    // Visual swipe cues
                    if (_dragOffset.dx > 40)
                      _buildOverlayTag('VERIFY', AppColors.success, Alignment.topLeft),
                    if (_dragOffset.dx < -40)
                      _buildOverlayTag('DISMISS', AppColors.danger, Alignment.topRight),
                    if (_dragOffset.dy < -40 && _dragOffset.dx.abs() < 40)
                      _buildOverlayTag('ESCALATE', AppColors.warning, Alignment.bottomCenter),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOverlayTag(String label, Color color, Alignment alignment) {
    return Positioned.fill(
      child: Align(
        alignment: alignment,
        child: Container(
          margin: const EdgeInsets.all(24),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.9),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w900,
              fontSize: 16,
              letterSpacing: 1,
            ),
          ),
        ),
      ),
    );
  }
}

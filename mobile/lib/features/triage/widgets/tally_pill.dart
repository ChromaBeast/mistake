import 'package:flutter/material.dart';
import '../../../core/utils/currency_formatter.dart';

class TallyPill extends StatelessWidget {
  final String label;
  final int count;
  final int paise;
  final Color color;
  final bool hideAmount;

  const TallyPill({
    super.key,
    required this.label,
    required this.count,
    required this.paise,
    required this.color,
    this.hideAmount = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          '$count $label',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.5,
            color: color,
          ),
        ),
        if (!hideAmount)
          Text(
            CurrencyFormatter.formatPaise(paise),
            style: TextStyle(
              fontSize: 11,
              fontFamily: 'monospace',
              fontWeight: FontWeight.w600,
              color: Colors.white.withValues(alpha: 0.9),
            ),
          ),
      ],
    );
  }
}

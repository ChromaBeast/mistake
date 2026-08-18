class CurrencyFormatter {
  const CurrencyFormatter._();

  /// Formats an integer amount in paise into standard Indian Rupee string: ₹XX,XX,XXX.XX
  static String formatPaise(int paise, {bool includeSymbol = true}) {
    final bool isNegative = paise < 0;
    final int absPaise = paise.abs();

    final int rupees = absPaise ~/ 100;
    final int remainderPaise = absPaise % 100;

    final String rupeesFormatted = _formatIndianInteger(rupees);
    final String paiseStr = remainderPaise.toString().padLeft(2, '0');

    final String symbol = includeSymbol ? '₹' : '';
    final String prefix = isNegative ? '-$symbol' : symbol;

    return '$prefix$rupeesFormatted.$paiseStr';
  }

  /// Converts an integer rupee count to Indian comma separated notation: 12,34,567
  static String _formatIndianInteger(int number) {
    final String numStr = number.toString();
    if (numStr.length <= 3) return numStr;

    final String lastThree = numStr.substring(numStr.length - 3);
    String remaining = numStr.substring(0, numStr.length - 3);

    final List<String> parts = [];
    while (remaining.length > 2) {
      parts.add(remaining.substring(remaining.length - 2));
      remaining = remaining.substring(0, remaining.length - 2);
    }
    if (remaining.isNotEmpty) {
      parts.add(remaining);
    }

    final String leading = parts.reversed.join(',');
    return '$leading,$lastThree';
  }

  /// Compact representation for dashboard cards: ₹1.45 L, ₹2.30 Cr, ₹45.0 K
  static String formatCompactPaise(int paise) {
    final bool isNegative = paise < 0;
    final int absPaise = paise.abs();
    final String sign = isNegative ? '-' : '';

    final int rupees = absPaise ~/ 100;

    if (rupees >= 10000000) {
      final int crValue = (rupees * 100 + 5000000) ~/ 10000000;
      final int whole = crValue ~/ 100;
      final int fraction = crValue % 100;
      return '$sign₹$whole.${fraction.toString().padLeft(2, '0')} Cr';
    } else if (rupees >= 100000) {
      final int lkValue = (rupees * 100 + 50000) ~/ 100000;
      final int whole = lkValue ~/ 100;
      final int fraction = lkValue % 100;
      return '$sign₹$whole.${fraction.toString().padLeft(2, '0')} L';
    } else if (rupees >= 1000) {
      final int kValue = (rupees * 10 + 500) ~/ 1000;
      final int whole = kValue ~/ 10;
      final int fraction = kValue % 10;
      return '$sign₹$whole.$fraction K';
    } else {
      return formatPaise(paise);
    }
  }
}

import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/utils/currency_formatter.dart';

void main() {
  group('CurrencyFormatter (Paise to INR)', () {
    test('formats zero paise correctly', () {
      expect(CurrencyFormatter.formatPaise(0), equals('₹0.00'));
    });

    test('formats paise under 1 rupee', () {
      expect(CurrencyFormatter.formatPaise(50), equals('₹0.50'));
      expect(CurrencyFormatter.formatPaise(5), equals('₹0.05'));
    });

    test('formats thousands with Indian comma notation', () {
      expect(CurrencyFormatter.formatPaise(2250000), equals('₹22,500.00'));
      expect(CurrencyFormatter.formatPaise(9999900), equals('₹99,999.00'));
    });

    test('formats lakhs correctly', () {
      expect(CurrencyFormatter.formatPaise(14523050), equals('₹1,45,230.50'));
      expect(CurrencyFormatter.formatPaise(50000000), equals('₹5,00,000.00'));
    });

    test('formats crores correctly', () {
      expect(CurrencyFormatter.formatPaise(1250000000), equals('₹1,25,00,000.00'));
      expect(CurrencyFormatter.formatPaise(10000000000), equals('₹10,00,00,000.00'));
    });

    test('handles negative values correctly', () {
      expect(CurrencyFormatter.formatPaise(-2250000), equals('-₹22,500.00'));
      expect(CurrencyFormatter.formatPaise(-14523050), equals('-₹1,45,230.50'));
    });

    test('formats compact representations correctly', () {
      expect(CurrencyFormatter.formatCompactPaise(2250000), equals('₹22.5 K'));
      expect(CurrencyFormatter.formatCompactPaise(14523050), equals('₹1.45 L'));
      expect(CurrencyFormatter.formatCompactPaise(1250000000), equals('₹1.25 Cr'));
      expect(CurrencyFormatter.formatCompactPaise(50000), equals('₹500.00'));
    });
  });
}

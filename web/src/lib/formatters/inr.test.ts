import { describe, it, expect } from "vitest";
import {
  paiseToRupees,
  rupeesToPaise,
  formatPaiseToINR,
  formatPaiseToCompactINR,
} from "./inr";

describe("INR Formatter Suite", () => {
  describe("paiseToRupees", () => {
    it("converts integer paise to rupees correctly", () => {
      expect(paiseToRupees(100)).toBe(1);
      expect(paiseToRupees(1500)).toBe(15);
      expect(paiseToRupees(0)).toBe(0);
      expect(paiseToRupees(null)).toBe(0);
      expect(paiseToRupees(undefined)).toBe(0);
    });

    it("handles BigInt input accurately", () => {
      expect(paiseToRupees(BigInt(100000000000))).toBe(1000000000);
    });
  });

  describe("rupeesToPaise", () => {
    it("converts rupees to paise minor units", () => {
      expect(rupeesToPaise(100.5)).toBe(10050);
      expect(rupeesToPaise(0)).toBe(0);
      expect(rupeesToPaise(null)).toBe(0);
    });
  });

  describe("formatPaiseToINR", () => {
    it("formats zero and small paise amounts", () => {
      expect(formatPaiseToINR(0)).toBe("₹ 0.00");
      expect(formatPaiseToINR(50)).toBe("₹ 0.50");
      expect(formatPaiseToINR(100)).toBe("₹ 1.00");
    });

    it("formats Indian lakh and crore groupings", () => {
      // 1 Lakh Rupees = 10,000,000 paise
      expect(formatPaiseToINR(10000000)).toBe("₹ 1,00,000.00");
      // 1 Crore Rupees = 1,000,000,000 paise
      expect(formatPaiseToINR(1000000000)).toBe("₹ 1,00,00,000.00");
    });

    it("handles negative amounts and options", () => {
      expect(formatPaiseToINR(-450000)).toBe("-₹ 4,500.00");
      expect(formatPaiseToINR(100000, { showSymbol: false })).toBe("1,000.00");
      expect(formatPaiseToINR(100000, { showDecimals: false })).toBe("₹ 1,000");
      expect(formatPaiseToINR(null, { placeholder: "--" })).toBe("--");
    });

    it("handles BigInt amounts without precision loss", () => {
      const bigPaise = BigInt(50000000000); // 50 Crore
      expect(formatPaiseToINR(bigPaise)).toBe("₹ 50,00,00,000.00");
    });
  });

  describe("formatPaiseToCompactINR", () => {
    it("formats compact denominations", () => {
      // Crores
      expect(formatPaiseToCompactINR(2500000000)).toBe("₹ 2.50 Cr");
      // Lakhs
      expect(formatPaiseToCompactINR(150000000)).toBe("₹ 15.00 L");
      // Thousands
      expect(formatPaiseToCompactINR(4500000)).toBe("₹ 45.0 K");
    });
  });
});

/**
 * Formatter utilities for Indian Rupee (INR) financial values.
 * All monetary amounts in the domain are stored as integer minor units (paise).
 * 1 INR = 100 Paise.
 */

const _BIGINT_100 = BigInt(100);

export function paiseToRupees(paise: number | bigint | null | undefined): number {
  if (paise === null || paise === undefined) return 0;
  if (typeof paise === "bigint") {
    // Use BigInt division to preserve precision, then convert for display only
    return Number(paise / _BIGINT_100) + Number(paise % _BIGINT_100) / 100;
  }
  if (isNaN(paise as number)) return 0;
  return (paise as number) / 100;
}

export function rupeesToPaise(rupees: number | null | undefined): number {
  if (rupees === null || rupees === undefined || isNaN(rupees)) {
    return 0;
  }
  return Math.round(rupees * 100);
}

/**
 * Formats a paise value into standard Indian numbering format (e.g. ₹ 12,34,567.89).
 */
export function formatPaiseToINR(
  paise: number | bigint | null | undefined,
  options?: {
    showDecimals?: boolean;
    showSymbol?: boolean;
    placeholder?: string;
  }
): string {
  if (paise === null || paise === undefined) {
    return options?.placeholder ?? "₹ 0.00";
  }

  // BigInt-safe path: avoid Number() conversion for values > MAX_SAFE_INTEGER
  let isNegative: boolean;
  let rupeesInt: bigint;
  let paiseFrac: bigint;

  if (typeof paise === "bigint") {
    const _ZERO = BigInt(0);
    isNegative = paise < _ZERO;
    const absPaise = paise < _ZERO ? -paise : paise;
    rupeesInt = absPaise / _BIGINT_100;
    paiseFrac = absPaise % _BIGINT_100;
  } else {
    const numericPaise = paise as number;
    isNegative = numericPaise < 0;
    const absPaise = Math.abs(numericPaise);
    rupeesInt = BigInt(Math.floor(absPaise / 100));
    paiseFrac = BigInt(Math.round(absPaise % 100));
  }

  const showDecimals = options?.showDecimals ?? true;
  const showSymbol = options?.showSymbol ?? true;

  const integerPart = rupeesInt.toString();
  const decimalPart = paiseFrac.toString().padStart(2, "0");

  // Format integer with Indian numbering system (3 digits, then groups of 2)
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }
  const formattedInteger =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

  const formattedDecimal = showDecimals ? `.${decimalPart}` : "";
  const symbol = showSymbol ? "₹ " : "";
  const sign = isNegative ? "-" : "";

  return `${sign}${symbol}${formattedInteger}${formattedDecimal}`;
}

/**
 * Formats paise into compact Indian notation (Cr, L, K).
 * E.g., 2500000000 -> "₹ 2.50 Cr", 150000000 -> "₹ 15.00 L"
 */
export function formatPaiseToCompactINR(
  paise: number | bigint | null | undefined,
  options?: { showSymbol?: boolean }
): string {
  if (paise === null || paise === undefined) return "₹ 0";

  const num = Number(paise);
  const isNegative = num < 0;
  const absRupees = Math.abs(num) / 100;
  const symbol = options?.showSymbol !== false ? "₹ " : "";
  const sign = isNegative ? "-" : "";

  if (absRupees >= 10000000) {
    // Crores
    const crores = absRupees / 10000000;
    return `${sign}${symbol}${crores.toFixed(2)} Cr`;
  } else if (absRupees >= 100000) {
    // Lakhs
    const lakhs = absRupees / 100000;
    return `${sign}${symbol}${lakhs.toFixed(2)} L`;
  } else if (absRupees >= 1000) {
    // Thousands
    const thousands = absRupees / 1000;
    return `${sign}${symbol}${thousands.toFixed(1)} K`;
  }

  return formatPaiseToINR(paise, options);
}

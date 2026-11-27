import type { Amount } from "@/lib/money/amounts";

const LOCALE = "en-US";

// One formatter per currency, made once (the performance skill, section 3).
const currencySigns = new Map<string, { prefix: boolean; sign: string }>();

/**
 * How a currency is written: the sign Intl gives an ISO code (`$` for USD,
 * `€` for EUR, `CA$` for CAD), before the number; any other Beancount
 * commodity (`VACHR`, `HOOL`) after it, as its name.
 */
function currencySign(currency: string): { prefix: boolean; sign: string } {
  const known = currencySigns.get(currency);
  if (known) return known;
  let found = { prefix: false, sign: currency };
  if (/^[A-Z]{3}$/.test(currency)) {
    try {
      const parts = new Intl.NumberFormat(LOCALE, { style: "currency", currency }).formatToParts(0);
      const sign = parts.find((part) => part.type === "currency")?.value;
      if (sign) found = { prefix: parts[0]?.type === "currency", sign };
    } catch {
      // not a currency Intl knows: written after the number
    }
  }
  currencySigns.set(currency, found);
  return found;
}

/**
 * A decimal string written with thousands separators and at least two
 * decimals, every digit gl-node sent kept: nothing is rounded, so an exact
 * figure stays exact on screen. `-1234.5` becomes `-1,234.50`.
 */
export function formatDecimal(value: string): string {
  const trimmed = value.trim();
  const negative = trimmed.startsWith("-");
  const unsigned = trimmed.replace(/^[-+]/, "");
  const [wholeDigits, fractionDigits = ""] = unsigned.split(".");
  const whole = (wholeDigits.replace(/^0+(?=\d)/, "") || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const fraction = fractionDigits.padEnd(2, "0");
  const isZero = /^[0,]*$/.test(whole) && /^0*$/.test(fraction);
  return `${negative && !isZero ? "-" : ""}${whole}.${fraction}`;
}

/** An amount with its currency: `$1,234.56`, `-€5.00`, `12.00 VACHR`, or the bare number when no currency is named. */
export function formatAmount(amount: Amount): string {
  const digits = formatDecimal(amount.number);
  if (amount.currency === "") return digits;
  const { prefix, sign } = currencySign(amount.currency);
  if (!prefix) return `${digits} ${sign}`;
  return digits.startsWith("-") ? `-${sign}${digits.slice(1)}` : `${sign}${digits}`;
}

import { describe, expect, test } from "bun:test";

import { addAmounts, amountsAreZero, negateAmounts } from "@/lib/money/amounts";
import { formatAmount, formatDecimal } from "@/lib/money/format-amount";

const usd = (number: string) => ({ number, currency: "USD" });
const eur = (number: string) => ({ number, currency: "EUR" });

describe("addAmounts", () => {
  test("adds exactly, where JavaScript numbers would drift", () => {
    expect(addAmounts([usd("0.1")], [usd("0.2")])).toEqual([usd("0.3")]);
    expect(addAmounts([usd("12345678901234567890.01")], [usd("0.02")])).toEqual([usd("12345678901234567890.03")]);
  });

  test("keeps each currency on its own, in the order they first appear, with no conversion", () => {
    expect(addAmounts([usd("10"), eur("5")], [eur("1.50")], [usd("-2")])).toEqual([usd("8"), eur("6.5")]);
  });

  test("keeps every decimal place gl-node sent", () => {
    expect(addAmounts([usd("0.0000000000000000000000000001")], [usd("1000")])).toEqual([usd("1000.0000000000000000000000000001")]);
  });

  test("of nothing is nothing", () => {
    expect(addAmounts()).toEqual([]);
    expect(addAmounts([], [])).toEqual([]);
  });
});

describe("negateAmounts and amountsAreZero", () => {
  test("flip the sign exactly", () => {
    expect(negateAmounts([usd("-250.50"), eur("3")])).toEqual([usd("250.5"), eur("-3")]);
  });

  test("zero is every figure zero, or none", () => {
    expect(amountsAreZero([usd("0"), eur("0.00")])).toBe(true);
    expect(amountsAreZero([])).toBe(true);
    expect(amountsAreZero([usd("0"), eur("0.01")])).toBe(false);
  });
});

describe("formatDecimal", () => {
  test("groups thousands and shows at least two decimals", () => {
    expect(formatDecimal("1234567.5")).toBe("1,234,567.50");
    expect(formatDecimal("0")).toBe("0.00");
    expect(formatDecimal("-40.25")).toBe("-40.25");
  });

  test("never rounds: extra decimals stay", () => {
    expect(formatDecimal("1000.0000000000000000000000000001")).toBe("1,000.0000000000000000000000000001");
  });

  test("writes negative zero as zero", () => {
    expect(formatDecimal("-0.00")).toBe("0.00");
  });
});

describe("formatAmount", () => {
  test("puts a known currency's sign before the number, after the minus", () => {
    expect(formatAmount(usd("1234.5"))).toBe("$1,234.50");
    expect(formatAmount(usd("-21.95"))).toBe("-$21.95");
    expect(formatAmount(eur("5"))).toBe("€5.00");
  });

  test("writes any other commodity after the number", () => {
    expect(formatAmount({ number: "12", currency: "VACHR" })).toBe("12.00 VACHR");
  });

  test("without a currency, the bare number", () => {
    expect(formatAmount({ number: "1000", currency: "" })).toBe("1,000.00");
  });
});

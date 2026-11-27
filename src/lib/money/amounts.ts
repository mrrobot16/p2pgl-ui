import Big from "big.js";

/**
 * A figure in one currency, as gl-node sends it: the number is a decimal
 * string and is never turned into a JavaScript number. `currency` is empty
 * when gl-node names none (the trial balance adds an account's currencies
 * into one figure).
 */
export type Amount = { number: string; currency: string };

/** One figure per currency, in the order the currencies first appear. */
export type Amounts = readonly Amount[];

/** Adds figures exactly, each currency on its own, with no conversion. */
export function addAmounts(...lists: Amounts[]): Amount[] {
  const sums = new Map<string, Big>();
  for (const list of lists) {
    for (const amount of list) {
      const sum = sums.get(amount.currency) ?? new Big(0);
      sums.set(amount.currency, sum.plus(amount.number));
    }
  }
  // toFixed() with no argument writes the exact value without an exponent.
  return [...sums].map(([currency, sum]) => ({ number: sum.toFixed(), currency }));
}

/** The same figures with the opposite sign. */
export function negateAmounts(list: Amounts): Amount[] {
  return list.map((amount) => ({ number: new Big(amount.number).times(-1).toFixed(), currency: amount.currency }));
}

/** True when there is no figure, or every figure is zero. */
export function amountsAreZero(list: Amounts): boolean {
  return list.every((amount) => new Big(amount.number).eq(0));
}

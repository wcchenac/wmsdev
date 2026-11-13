/**
 * Round to a power of ten without binary floating-point drift, e.g.
 * round10(1.005, -2) === 1.01 where Math.round(1.005 * 100) / 100 gives 1. Shifts the
 * decimal point through the exponent of the number's string form instead of multiplying.
 *
 * @param value The number to round.
 * @param exp   The exponent of the rounding base: -2 rounds to 0.01, -1 to 0.1, 1 to 10.
 */
export function round10(value: number, exp?: number): number {
  if (exp === undefined || +exp === 0) {
    return Math.round(value);
  }
  const numericValue = +value;
  const exponent = +exp;
  if (isNaN(numericValue) || exponent % 1 !== 0) {
    return NaN;
  }
  // Shift
  const parts = numericValue.toString().split("e");
  const shifted = Math.round(+(parts[0] + "e" + (parts[1] ? +parts[1] - exponent : -exponent)));
  // Shift back
  const shiftedParts = shifted.toString().split("e");
  return +(shiftedParts[0] + "e" + (shiftedParts[1] ? +shiftedParts[1] + exponent : exponent));
}

import { round10 } from '../../utilities/DecimalAdjust';

describe('round10', () => {
  test('rounds without binary floating-point drift', () => {
    expect(round10(1.005, -2)).toBe(1.01);
    expect(round10(0.1 + 0.2, -2)).toBe(0.3);
    expect(round10(10.55, -1)).toBe(10.6);
  });

  test('rounds negative numbers half up like Math.round', () => {
    expect(round10(-0.55, -1)).toBe(-0.5);
    expect(round10(-18.04, -1)).toBe(-18);
  });

  test('positive exponents round to tens, hundreds, ...', () => {
    expect(round10(55, 1)).toBe(60);
    expect(round10(1234, 2)).toBe(1200);
  });

  test('exponent 0 is plain Math.round', () => {
    expect(round10(2.5, 0)).toBe(3);
  });

  test('handles numbers already in exponent notation', () => {
    expect(round10(1.23456e-7, -9)).toBe(1.23e-7);
    expect(round10(1e21, -2)).toBe(1e21);
  });

  test('returns NaN for NaN input or a non-integer exponent', () => {
    expect(round10(NaN, -2)).toBeNaN();
    expect(round10(1.5, -1.5)).toBeNaN();
  });
});

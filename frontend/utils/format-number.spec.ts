import { formatNumber } from './format-number';

test.each([
  ['1', '1'],
  ['1234', '1,234'],
  ['1234.5555', '1,234.5555'],
  ['.34', '0.34'],
  ['100000000', '100,000,000'],
  ['100000000.0000005', '100,000,000.0000005'],
])('should format number correctly', (input, expected) => {
  expect(formatNumber(input)).toBe(expected);
});

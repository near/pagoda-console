import { sanitizeNumber } from './sanitize-number';

test.each([
  ['1,000', '1000'],
  ['-01000', '-1000'],
  ['01,200.5010', '1200.501'],
])('should sanitize numbers correctly', (input, expected) => {
  expect(sanitizeNumber(input)).toBe(expected);
});

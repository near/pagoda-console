import { sanitizeNumber } from './sanitize-number';

test.each([
  [undefined, ''],
  ['', ''],
  ['1,000', '1000'],
  ['-01000', '-1000'],
  ['01,200.5010', '1200.501'],
  ['00000012300005000,0000000000000000.0000', '123000050000000000000000000'],
])('should sanitize numbers correctly', (input, expected) => {
  expect(sanitizeNumber(input)).toBe(expected);
});

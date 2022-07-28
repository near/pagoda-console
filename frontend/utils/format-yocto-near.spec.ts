import { formatYoctoNear } from './format-yocto-near';

test.each([
  ['123000050000000000000000000', '123.00005 Ⓝ'],
  ['50000000000000000000000', '0.005 Ⓝ'],
  ['50000000000000000000', '<0.00001 Ⓝ'],
  ['34', '<0.00001 Ⓝ'],
])('should format yoctoNEAR correctly', (input, expected) => {
  expect(formatYoctoNear(input)).toBe(expected);
});

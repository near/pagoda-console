import { convertNearToYocto, convertYoctoToNear } from './convert-near';

test.each([
  [undefined, ''],
  ['', ''],
  ['0', '0'],
  ['1000000000000000000000000', '1'],
  ['100000000000000000000000', '0.1'],
  ['50000000000000000000000', '0.05'],
  ['1234000050000000000000000000', '1234.00005'],
  ['34', '0.00001'],
  ['63639161663362156200000000', '63.63916'],
])('should convert from Yocto to NEAR correctly', (input, expected) => {
  expect(convertYoctoToNear(input)).toBe(expected);
});

test.each([
  [undefined, ''],
  ['', ''],
  ['0', '0 Ⓝ'],
  ['1234000050000000000000000000', '1,234.00005 Ⓝ'],
  ['34', '<0.00001 Ⓝ'],
])('should convert and format from Yocto to NEAR correctly', (input, expected) => {
  expect(convertYoctoToNear(input, true)).toBe(expected);
});

test.each([
  [undefined, ''],
  ['', ''],
  ['0', '0'],
  ['1', '1000000000000000000000000'],
  ['0.1', '100000000000000000000000'],
  ['0.05', '50000000000000000000000'],
  ['1234.00005', '1234000050000000000000000000'],
  ['0.00001', '10000000000000000000'],
  ['63.63916', '63639160000000000000000000'],
])('should convert from Near to Yocto correctly', (input, expected) => {
  expect(convertNearToYocto(input)).toBe(expected);
});

test.each([
  [undefined, ''],
  ['', ''],
  ['0', '0 yoctoⓃ'],
  ['1234.00005', '1,234,000,050,000,000,000,000,000,000 yoctoⓃ'],
  ['0.00001', '10,000,000,000,000,000,000 yoctoⓃ'],
])('should convert and format from Near to Yocto correctly', (input, expected) => {
  expect(convertNearToYocto(input, true)).toBe(expected);
});

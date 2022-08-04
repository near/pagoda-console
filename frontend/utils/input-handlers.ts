import type { FormEvent } from 'react';

export function numberInputHandler(
  event: FormEvent<HTMLInputElement>,
  options?: {
    allowComma?: boolean;
    allowDecimal?: boolean;
    allowNegative?: boolean;
  },
) {
  const { allowComma, allowDecimal, allowNegative } = {
    allowComma: true,
    allowDecimal: false,
    allowNegative: false,
    ...options,
  };

  let allowed = '\\d';

  if (allowComma) allowed += ',';
  if (allowDecimal) allowed += '.';
  if (allowNegative) allowed += '-';

  const regex = new RegExp(`[^${allowed}]`, 'g');
  let validCharacters = event.currentTarget.value.replace(regex, '');

  if (allowNegative && validCharacters.includes('-')) {
    // Ensures a single "-" at the beginning if the number is negative
    validCharacters = `-${validCharacters.replace(/-/g, '')}`;
  }

  if (allowDecimal && validCharacters.includes('.')) {
    // Ensures only a single period exists if dealing with a decimal number
    const indexOfDecimal = validCharacters.indexOf('.');
    validCharacters =
      validCharacters.substring(0, indexOfDecimal) + '.' + validCharacters.substring(indexOfDecimal).replace(/\./g, '');
  }

  if (validCharacters !== event.currentTarget.value) {
    event.currentTarget.value = validCharacters;
  }
}

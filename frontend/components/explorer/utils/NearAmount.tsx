import React from 'react';

import { styled } from '@/styles/stitches';
import type { NearDecimalPower } from '@/utils/formatting';
import { formatToPowerOfTen, NEAR_DENOMINATION } from '@/utils/formatting';

import NearIcon from './NearIcon';

const Offsetted = styled('span', {
  marginLeft: '0.3em',
});

type Props = {
  amount: string;
  decimalPlaces?: number;
};

export const NearAmount: React.FC<Props> = (props) => {
  const formattedAmount = formatToPowerOfTen<NearDecimalPower>(props.amount, 11);
  return (
    <>
      {formattedAmount.quotient}
      {formattedAmount.remainder
        ? Number('0.' + formattedAmount.remainder)
            .toPrecision(props.decimalPlaces ?? 3)
            .slice(1)
        : ''}

      {formattedAmount.quotient !== '0' || formattedAmount.remainder ? (
        <Offsetted>
          {NEAR_DENOMINATION[formattedAmount.prefix]}
          <NearIcon />
        </Offsetted>
      ) : null}
    </>
  );
};

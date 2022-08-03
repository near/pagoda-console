import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import type { ComponentProps } from '@stitches/react';
import { forwardRef } from 'react';

import { truncateMiddle } from '@/utils/truncate-middle';

import * as S from './styles';

type Props = Omit<ComponentProps<typeof S.Root>, 'prefix'> & {
  prefix: number;
  prefixLaptop?: number;
  prefixTablet?: number;
  prefixMobile?: number;
  suffix: number;
  suffixLaptop?: number;
  suffixTablet?: number;
  suffixMobile?: number;
  value: string;
};

export const TruncateMiddle = forwardRef<HTMLSpanElement, Props>(
  (
    {
      prefix,
      prefixLaptop,
      prefixTablet,
      prefixMobile,
      suffix,
      suffixLaptop,
      suffixTablet,
      suffixMobile,
      value,
      ...props
    },
    ref,
  ) => {
    prefixLaptop = prefixLaptop === undefined ? prefix : prefixLaptop;
    prefixTablet = prefixTablet === undefined ? prefixLaptop : prefixTablet;
    prefixMobile = prefixMobile === undefined ? prefixTablet : prefixMobile;

    suffixLaptop = suffixLaptop === undefined ? suffix : suffixLaptop;
    suffixTablet = suffixTablet === undefined ? suffixLaptop : suffixTablet;
    suffixMobile = suffixMobile === undefined ? suffixTablet : suffixMobile;

    const standard = truncateMiddle(value, prefix, suffix);
    const laptop = truncateMiddle(value, prefixLaptop, suffixLaptop);
    const tablet = truncateMiddle(value, prefixTablet, suffixTablet);
    const mobile = truncateMiddle(value, prefixMobile, suffixMobile);

    return (
      <S.Root ref={ref} {...props}>
        <VisuallyHidden>{value}</VisuallyHidden>
        <S.Section standard aria-hidden="true">
          {standard}
        </S.Section>
        <S.Section laptop aria-hidden="true">
          {laptop}
        </S.Section>
        <S.Section tablet aria-hidden="true">
          {tablet}
        </S.Section>
        <S.Section mobile aria-hidden="true">
          {mobile}
        </S.Section>
      </S.Root>
    );
  },
);
TruncateMiddle.displayName = 'TruncateMiddle';

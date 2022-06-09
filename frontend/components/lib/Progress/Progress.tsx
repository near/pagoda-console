import type { ComponentProps } from 'react';

import * as S from './styles';

type Props = Omit<ComponentProps<typeof S.Root>, 'max' | 'value'> & {
  max: number;
  value: number;
};

export const Progress = ({ value, max, ...props }: Props) => {
  const cappedValue = Math.min(Math.max(value, 0), max);
  const progress = cappedValue / max;

  return (
    <S.Root max={max} value={cappedValue} {...props}>
      <S.Indicator
        css={{
          transform: `translateX(-${100 * (1 - progress)}%)`,
        }}
      />
    </S.Root>
  );
};

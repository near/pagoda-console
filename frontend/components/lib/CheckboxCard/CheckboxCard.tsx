import type { VariantProps } from '@stitches/react';
import type { ComponentProps } from 'react';
import { forwardRef } from 'react';

import * as S from './styles';

type CardProps = Omit<ComponentProps<typeof S.Input>, 'type' | 'radioGroup'> &
  VariantProps<typeof S.Label> & {
    isInvalid?: boolean;
    radio?: boolean;
  };

type GroupProps = ComponentProps<typeof S.Group>;

export const Title = S.Title;
export const Description = S.Description;

export const Group = ({ children, ...props }: GroupProps) => {
  return (
    <S.Group role="group" {...props}>
      {children}
    </S.Group>
  );
};

export const Card = forwardRef<HTMLInputElement, CardProps>(
  ({ children, css, isInvalid, radio = false, ...props }, ref) => {
    const type = radio ? 'radio' : 'checkbox';

    return (
      <S.Label css={css}>
        <S.Input aria-invalid={isInvalid} type={type} ref={ref} {...props} />

        <S.Card invalid={isInvalid}>{children}</S.Card>
      </S.Label>
    );
  },
);
Card.displayName = 'Card';

import type { ComponentProps } from 'react';
import { forwardRef } from 'react';

import { FeatherIcon } from '../FeatherIcon';
import * as S from './Checkbox.styles';

type Props = Omit<ComponentProps<typeof S.Input>, 'type' | 'radioGroup'> & {
  isInvalid?: boolean;
  radio?: boolean;
};

export const CheckboxGroup = S.CheckboxGroup;

export const Checkbox = forwardRef<HTMLInputElement, Props>(
  ({ children, css, isInvalid, radio = false, ...props }, ref) => {
    const type = radio ? 'radio' : 'checkbox';

    return (
      <S.Label css={css}>
        <S.Input aria-invalid={isInvalid} type={type} ref={ref} {...props} />

        <S.Indicator invalid={isInvalid} radio={radio}>
          {radio ? (
            <FeatherIcon icon="circle" fill="currentColor" stroke="none" />
          ) : (
            <FeatherIcon icon="check" strokeWidth={4} />
          )}
        </S.Indicator>

        <S.Description>{children}</S.Description>
      </S.Label>
    );
  },
);
Checkbox.displayName = 'Checkbox';

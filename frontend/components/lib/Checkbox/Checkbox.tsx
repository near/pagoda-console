import type { ComponentProps } from 'react';
import { forwardRef } from 'react';

import { FeatherIcon } from '../FeatherIcon';
import * as S from './styles';

type CheckboxProps = Omit<ComponentProps<typeof S.Input>, 'type' | 'radioGroup'> & {
  isInvalid?: boolean;
  radio?: boolean;
};

type CheckboxGroupProps = ComponentProps<typeof S.CheckboxGroup>;

export const CheckboxGroup = ({ children, ...props }: CheckboxGroupProps) => {
  return (
    <S.CheckboxGroup role="group" {...props}>
      {children}
    </S.CheckboxGroup>
  );
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
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

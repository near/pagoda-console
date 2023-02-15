import type { ComponentProps } from 'react';
import { forwardRef } from 'react';

import { FeatherIcon } from '../FeatherIcon';
import * as S from './styles';

type CheckboxProps = Omit<ComponentProps<typeof S.Input>, 'type' | 'radioGroup'> & {
  isInvalid?: boolean;
  radio?: boolean;
  loader?: boolean;
};

type CheckboxGroupProps = ComponentProps<typeof S.Group>;

export const CheckboxGroup = ({ children, ...props }: CheckboxGroupProps) => {
  return (
    <S.Group role="group" {...props}>
      {children}
    </S.Group>
  );
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ children, css, disabled, isInvalid, loader, radio = false, ...props }, ref) => {
    const type = radio ? 'radio' : 'checkbox';

    return (
      <S.Label disabled={disabled} css={css}>
        <S.Input aria-invalid={isInvalid} type={type} ref={ref} disabled={disabled} {...props} />

        <S.Indicator loader={loader} invalid={isInvalid} radio={radio}>
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

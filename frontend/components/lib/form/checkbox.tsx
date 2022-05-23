import { faCheck, faCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ComponentProps } from 'react';
import { forwardRef } from 'react';

import * as S from './checkbox.styles';

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
          <FontAwesomeIcon icon={radio ? faCircle : faCheck} />
        </S.Indicator>

        <S.Description>{children}</S.Description>
      </S.Label>
    );
  },
);
Checkbox.displayName = 'Checkbox';

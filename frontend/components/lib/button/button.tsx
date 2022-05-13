import type { ComponentProps, ElementType } from 'react';
import { forwardRef } from 'react';

import * as S from './styles';

type Props = ComponentProps<typeof S.Button> & {
  as?: ElementType;
};

export const Button = forwardRef<ElementType<typeof S.Button>, Props>(
  ({ children, type = 'button', ...props }, ref) => {
    return (
      <S.Button type={type} {...props} ref={ref}>
        <S.Content>{children}</S.Content>
      </S.Button>
    );
  },
);
Button.displayName = 'Button';

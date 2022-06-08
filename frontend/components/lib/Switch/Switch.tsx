import type { ComponentProps } from 'react';
import { forwardRef } from 'react';

import * as S from './styles';

type Props = ComponentProps<typeof S.Switch>;

export const Switch = forwardRef<HTMLButtonElement, Props>(({ children, ...props }, ref) => {
  return (
    <S.Switch {...props} ref={ref}>
      <S.SwitchThumb>{children}</S.SwitchThumb>
    </S.Switch>
  );
});
Switch.displayName = 'Switch';

import type { ComponentProps } from 'react';
import { forwardRef } from 'react';

import { Button } from '../Button';
import { FeatherIcon } from '../FeatherIcon';
import * as S from './styles';

type BoxProps = ComponentProps<typeof S.Box> & {
  toggleButtonProps?: ComponentProps<typeof Button>;
};

export const Root = S.Root;
export const Menu = S.Menu;
export const MenuContent = S.MenuContent;
export const MenuItem = S.MenuItem;
export const MenuLabel = S.MenuLabel;

export const Box = forwardRef<HTMLDivElement, BoxProps>(({ children, toggleButtonProps, ...props }, ref) => {
  return (
    <S.Box ref={ref} {...props}>
      {children}

      {toggleButtonProps && (
        <Button color="input" {...toggleButtonProps}>
          <FeatherIcon color="text3" fill="currentColor" stroke="none" icon="chevron-down" />
        </Button>
      )}
    </S.Box>
  );
});
Box.displayName = 'Box';

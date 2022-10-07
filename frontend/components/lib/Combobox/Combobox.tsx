import type { ComponentProps } from 'react';
import { forwardRef } from 'react';

import { StableId } from '@/utils/stable-ids';

import { Button } from '../Button';
import { FeatherIcon } from '../FeatherIcon';
import * as S from './styles';

type BoxProps = ComponentProps<typeof S.Box> & {
  toggleButtonProps?: Omit<ComponentProps<typeof Button>, 'stableId'>;
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
        <Button stableId={StableId.COMBOBOX_TOGGLE_BUTTON} color="input" {...toggleButtonProps}>
          <FeatherIcon color="text3" fill="currentColor" stroke="none" icon="chevron-down" />
        </Button>
      )}
    </S.Box>
  );
});
Box.displayName = 'Box';

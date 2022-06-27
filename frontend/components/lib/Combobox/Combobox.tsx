import type { ChangeEvent, ComponentProps, FocusEvent, Ref } from 'react';
import { forwardRef } from 'react';

import { mergeRefs } from '@/utils/merge-refs';

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

interface InputOptions {
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  ref: Ref<HTMLInputElement>;
  [x: string]: any;
}

export function mergeComboboxInputProps(input1: InputOptions, input2: InputOptions): InputOptions {
  return {
    ...input1,
    ...input2,
    onBlur: (event) => {
      input1.onBlur(event);
      input2.onBlur(event);
    },
    onChange: (event) => {
      input1.onChange(event);
      input2.onChange(event);
    },
    ref: mergeRefs([input1.ref, input2.ref]),
  };
}

import * as PopoverPrimitive from '@radix-ui/react-popover';
import type { ComponentProps } from 'react';
import { forwardRef } from 'react';

import { ButtonDropdown } from '../Button';
import { FeatherIcon } from '../FeatherIcon';
import * as S from './styles';

type ButtonProps = ComponentProps<typeof ButtonDropdown>;
type ContentProps = Omit<ComponentProps<typeof S.Content>, 'title'> & {
  maxHeight?: string;
};
type CloseButtonProps = ComponentProps<typeof S.CloseButton>;

export const Root = PopoverPrimitive.Root;
export const Trigger = PopoverPrimitive.Trigger;
export const Close = PopoverPrimitive.Close;
export const Anchor = PopoverPrimitive.Anchor;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  return (
    <Trigger asChild>
      <ButtonDropdown ref={ref} {...props}>
        {children}
      </ButtonDropdown>
    </Trigger>
  );
});
Button.displayName = 'Button';

export const Content = forwardRef<HTMLDivElement, ContentProps>(
  ({ children, maxHeight, sideOffset = 6, ...props }, ref) => {
    return (
      <S.Content ref={ref} sideOffset={sideOffset} {...props}>
        <S.ContentInner
          css={{
            maxHeight,
          }}
        >
          {children}
        </S.ContentInner>
        <S.Arrow offset={16} />
      </S.Content>
    );
  },
);
Content.displayName = 'Content';

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>((props, ref) => {
  return (
    <S.CloseButton aria-label="Close" ref={ref} {...props}>
      <FeatherIcon icon="x" />
    </S.CloseButton>
  );
});
CloseButton.displayName = 'CloseButton';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import type { ComponentProps } from 'react';
import { forwardRef } from 'react';

import * as S from './styles';

type ContentProps = Omit<ComponentProps<typeof S.Content>, 'title'>;
type CloseButtonProps = ComponentProps<typeof S.CloseButton>;

export const Root = PopoverPrimitive.Root;
export const Trigger = PopoverPrimitive.Trigger;
export const Close = PopoverPrimitive.Close;

export const Content = forwardRef<HTMLDivElement, ContentProps>(({ children, sideOffset = 6, ...props }, ref) => {
  return (
    <S.Content ref={ref} sideOffset={sideOffset} {...props}>
      {children}
      <S.Arrow offset={16} />
    </S.Content>
  );
});
Content.displayName = 'Content';

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>((props, ref) => {
  return (
    <S.CloseButton aria-label="Close" ref={ref} {...props}>
      <FontAwesomeIcon icon={faTimes} />
    </S.CloseButton>
  );
});
CloseButton.displayName = 'CloseButton';

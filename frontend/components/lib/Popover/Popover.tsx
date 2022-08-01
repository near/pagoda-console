import * as PopoverPrimitive from '@radix-ui/react-popover';
import type { ComponentProps } from 'react';
import { useEffect, useRef } from 'react';
import { forwardRef } from 'react';

import { ButtonDropdown } from '../Button';
import { FeatherIcon } from '../FeatherIcon';
import * as S from './styles';

type ButtonProps = ComponentProps<typeof ButtonDropdown>;
type ContentProps = Omit<ComponentProps<typeof S.Content>, 'title'>;
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

export const Content = forwardRef<HTMLDivElement, ContentProps>(({ children, sideOffset = 6, ...props }, ref) => {
  const containerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    window.addEventListener('resize', onWindowResize);
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function calculateWidth(container?: HTMLDivElement) {
    containerRef.current = container || containerRef.current;
    if (!containerRef.current) return;

    const menuId = containerRef.current.getAttribute('id');
    if (!menuId) return;
    const trigger = document.querySelector<HTMLElement>(`[aria-controls="${menuId}"]`);

    if (trigger?.offsetWidth) {
      containerRef.current.style.setProperty('--trigger-width', `${trigger.offsetWidth}px`);
    }
  }

  function onWindowResize() {
    calculateWidth();
  }

  return (
    <S.Content onAnimationStart={(e) => calculateWidth(e.currentTarget)} ref={ref} sideOffset={sideOffset} {...props}>
      <S.ContentInner>{children}</S.ContentInner>
      <S.Arrow offset={16} />
    </S.Content>
  );
});
Content.displayName = 'Content';

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>((props, ref) => {
  return (
    <S.CloseButton aria-label="Close" ref={ref} {...props}>
      <FeatherIcon icon="x" />
    </S.CloseButton>
  );
});
CloseButton.displayName = 'CloseButton';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import type { ComponentProps, ReactNode } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { forwardRef } from 'react';

import type { StitchesCSS } from '@/styles/stitches';

import { ButtonDropdown } from '../Button';
import { FeatherIcon } from '../FeatherIcon';
import { Flex } from '../Flex';
import * as S from './styles';

type ButtonProps = ComponentProps<typeof ButtonDropdown>;
type ContentProps = ComponentProps<typeof S.Content> & {
  innerCss?: StitchesCSS;
};
type CheckboxItemProps = ComponentProps<typeof S.CheckboxItem> & {
  indicator?: ReactNode | null;
};
type RadioItemProps = ComponentProps<typeof S.RadioItem> & {
  indicator?: ReactNode | null;
};
type SubContentProps = ComponentProps<typeof S.SubContent>;
type SubTriggerProps = ComponentProps<typeof S.SubTrigger>;

export const Item = S.Item;
export const Label = S.Label;
export const RadioGroup = DropdownMenuPrimitive.RadioGroup;
export const Root = DropdownMenuPrimitive.Root;
export const Separator = S.Separator;
export const Trigger = DropdownMenuPrimitive.Trigger;
export const ContentItem = S.ContentItem;
export const Portal = DropdownMenuPrimitive.Portal;
export const Sub = DropdownMenuPrimitive.Sub;

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

export const Content = forwardRef<HTMLDivElement, ContentProps>(({ children, innerCss, ...props }, ref) => {
  const alignOffset = props.alignOffset || 0;
  const sideOffset = props.sideOffset || 6;
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

    const triggerId = containerRef.current.getAttribute('aria-labelledby');
    if (!triggerId) return;
    const trigger = document.getElementById(triggerId);

    if (trigger?.offsetWidth) {
      containerRef.current.style.setProperty('--trigger-width', `${trigger.offsetWidth}px`);
    }
  }

  function onWindowResize() {
    calculateWidth();
  }

  return (
    <DropdownMenuPrimitive.Portal>
      <S.Content
        onAnimationStart={(e) => calculateWidth(e.currentTarget)}
        ref={ref}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        {...props}
      >
        <S.ContentInner css={innerCss}>{children}</S.ContentInner>
        <S.Arrow />
      </S.Content>
    </DropdownMenuPrimitive.Portal>
  );
});
Content.displayName = 'Content';

export const SubContent = forwardRef<HTMLDivElement, SubContentProps>(({ children, ...props }, ref) => {
  const alignOffset = props.alignOffset || -6;
  const sideOffset = props.sideOffset || 14;

  return (
    <DropdownMenuPrimitive.Portal>
      <S.SubContent ref={ref} alignOffset={alignOffset} sideOffset={sideOffset} {...props}>
        <S.ContentInner>{children}</S.ContentInner>
        <S.Arrow />
      </S.SubContent>
    </DropdownMenuPrimitive.Portal>
  );
});
SubContent.displayName = 'SubContent';

export const CheckboxItem = forwardRef<HTMLDivElement, CheckboxItemProps>(({ children, indicator, ...props }, ref) => {
  return (
    <S.CheckboxItem ref={ref} {...props}>
      {indicator !== null && (
        <>
          <S.ItemSelectedIndicator>
            {indicator ? indicator : <FeatherIcon icon="check-square" />}
          </S.ItemSelectedIndicator>
          <S.ItemUnselectedIndicator>{indicator ? indicator : <FeatherIcon icon="square" />}</S.ItemUnselectedIndicator>
        </>
      )}

      {children}
    </S.CheckboxItem>
  );
});
CheckboxItem.displayName = 'CheckboxItem';

export const RadioItem = forwardRef<HTMLDivElement, RadioItemProps>(({ children, indicator, ...props }, ref) => {
  return (
    <S.RadioItem ref={ref} {...props}>
      {indicator !== null && (
        <>
          <S.ItemSelectedIndicator>
            {indicator ? indicator : <FeatherIcon icon="check-circle" />}
          </S.ItemSelectedIndicator>
          <S.ItemUnselectedIndicator>{indicator ? indicator : <FeatherIcon icon="circle" />}</S.ItemUnselectedIndicator>
        </>
      )}

      {children}
    </S.RadioItem>
  );
});
RadioItem.displayName = 'RadioItem';

export const SubTrigger = forwardRef<HTMLDivElement, SubTriggerProps>(({ children, ...props }, ref) => {
  return (
    <S.SubTrigger ref={ref} {...props}>
      <Flex gap="s">{children}</Flex>

      <FeatherIcon icon="chevron-right" />
    </S.SubTrigger>
  );
});
SubTrigger.displayName = 'SubTrigger';

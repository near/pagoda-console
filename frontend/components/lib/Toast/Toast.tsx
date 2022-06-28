import * as ToastPrimitive from '@radix-ui/react-toast';
import type { ComponentProps } from 'react';
import { forwardRef } from 'react';

import { FeatherIcon } from '../FeatherIcon';
import * as S from './styles';

type CloseButtonProps = ComponentProps<typeof S.CloseButton>;

export const Root = S.Root;
export const Title = S.Title;
export const Description = S.Description;
export const Viewport = S.Viewport;
export const Action = ToastPrimitive.Action;
export const Provider = ToastPrimitive.Provider;
export const Close = ToastPrimitive.Close;

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>((props, ref) => {
  return (
    <S.CloseButton aria-label="Close" ref={ref} {...props}>
      <FeatherIcon icon="x" />
    </S.CloseButton>
  );
});
CloseButton.displayName = 'CloseButton';

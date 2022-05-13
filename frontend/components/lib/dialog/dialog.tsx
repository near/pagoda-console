/*
  https://www.radix-ui.com/docs/primitives/components/dialog
*/

import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { ComponentProps } from 'react';

import * as S from './styles';

export const Root = DialogPrimitive.Root;
export const Trigger = DialogPrimitive.Trigger;
export const Close = DialogPrimitive.Close;

export const Content = ({ children, ...props }: ComponentProps<typeof S.Content>) => {
  return (
    <DialogPrimitive.Portal>
      <S.Overlay />
      <S.ContentWrapper>
        <S.Content {...props}>
          <Close>Close</Close>
          {children}
        </S.Content>
      </S.ContentWrapper>
    </DialogPrimitive.Portal>
  );
};

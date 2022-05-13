/*
  https://www.radix-ui.com/docs/primitives/components/dialog
*/

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { ComponentProps, ReactNode } from 'react';

import { Stack } from '../stack';
import * as S from './styles';

export const Root = DialogPrimitive.Root;
export const Trigger = DialogPrimitive.Trigger;
export const Close = DialogPrimitive.Close;

type ContentProps = Omit<ComponentProps<typeof S.Content>, 'title'> & {
  title?: ReactNode;
};

export const Content = ({ children, title, ...props }: ContentProps) => {
  return (
    <DialogPrimitive.Portal>
      <S.Overlay />
      <S.Wrapper>
        <S.Content {...props}>
          {title && (
            <S.Header>
              {typeof title === 'string' && <S.Title>{title}</S.Title>}
              {typeof title !== 'string' && { title }}

              <S.CloseButton>
                <FontAwesomeIcon icon={faTimes}></FontAwesomeIcon>
              </S.CloseButton>
            </S.Header>
          )}

          <S.ContentInner>
            <Stack>{children}</Stack>
          </S.ContentInner>
        </S.Content>
      </S.Wrapper>
    </DialogPrimitive.Portal>
  );
};

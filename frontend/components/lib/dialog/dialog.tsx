/*
  https://www.radix-ui.com/docs/primitives/components/dialog
*/

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { ComponentProps, ReactNode } from 'react';
import { forwardRef } from 'react';

import { Flex } from '../flex';
import * as S from './styles';

export const Close = DialogPrimitive.Close;
export const Root = DialogPrimitive.Root;
export const Title = S.Title;
export const Trigger = DialogPrimitive.Trigger;

type ContentProps = Omit<ComponentProps<typeof S.Content>, 'title'> & {
  title?: ReactNode;
};

export const Content = forwardRef<HTMLDivElement, ContentProps>(({ children, title, ...props }, ref) => {
  return (
    <DialogPrimitive.Portal>
      <S.Overlay>
        <S.Content aria-describedby={undefined} ref={ref} {...props}>
          {/*
            Descriptions are optional: https://www.radix-ui.com/docs/primitives/components/dialog#description
            The modal is already labeled with the title attribute via "aria-labelledby" - so description is a
            bit overkill. This is why we're setting aria-describedby={undefined} since we don't intend to
            use <DialogPrimitive.Description>.
          */}

          {title && (
            <S.Header>
              <S.HeaderContent>{typeof title === 'string' ? <S.Title>{title}</S.Title> : title}</S.HeaderContent>

              <S.CloseButton>
                <FontAwesomeIcon icon={faTimes}></FontAwesomeIcon>
              </S.CloseButton>
            </S.Header>
          )}

          <S.ContentBody>
            <Flex stack>{children}</Flex>
          </S.ContentBody>
        </S.Content>
      </S.Overlay>
    </DialogPrimitive.Portal>
  );
});
Content.displayName = 'DialogContent';

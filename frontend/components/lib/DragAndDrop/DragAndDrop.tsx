import type { DragEvent, LabelHTMLAttributes } from 'react';
import { forwardRef, useRef } from 'react';

import type { StitchesCSS, StitchesProps } from '@/styles/stitches';
import { mergeRefs } from '@/utils/merge-refs';

import * as S from './styles';
import useDragging from './useDragging';

type Props = StitchesProps<typeof S.Root> & {
  css?: StitchesCSS;
  stableId?: string;
};

type DragAndDropProps = Props &
  LabelHTMLAttributes<HTMLLabelElement> & {
    onChange?: (event: DragEvent<HTMLLabelElement>) => any;
  };

export const DragAndDropLabel = forwardRef<HTMLLabelElement, DragAndDropProps>(
  ({ children, stableId, onChange, ...props }, ref) => {
    const elementRef = useRef<HTMLLabelElement>(null);
    const isDragging = useDragging({
      elementRef,
      onChange,
    });

    return (
      <S.Root
        dragging={isDragging}
        ref={mergeRefs([ref, elementRef])}
        data-stable-id={stableId}
        tabIndex={0}
        {...props}
      >
        <S.Content>{children}</S.Content>
      </S.Root>
    );
  },
);
DragAndDropLabel.displayName = 'DragAndDropLabel';

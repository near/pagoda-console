import type { DragEvent, LabelHTMLAttributes } from 'react';
import { forwardRef, useRef } from 'react';

import type { StitchesCSS, StitchesProps } from '@/styles/stitches';

import * as S from './styles';
import useDragging from './useDragging';

type Props = StitchesProps<typeof S.DragAndDropButton> & {
  css?: StitchesCSS;
  stableId?: string;
};

type DragAndDropProps = Props & LabelHTMLAttributes<HTMLLabelElement> & {
  handleChange?: (event: DragEvent<HTMLLabelElement>) => any;
};

export const DragAndDropLabel = forwardRef<HTMLLabelElement, DragAndDropProps>(
  ({ children, stableId, handleChange, ...props }, _ref) => {
    const labelRef = useRef<HTMLLabelElement>(null);
    useDragging({
      labelRef,
      handleChange,
    })

    return (
      <S.DragAndDropButton as="label" ref={labelRef} data-stable-id={stableId} tabIndex={0} {...props}>
        <S.Content>{children}</S.Content>
      </S.DragAndDropButton>
    );
  },
);
DragAndDropLabel.displayName = 'DragAndDropLabel';
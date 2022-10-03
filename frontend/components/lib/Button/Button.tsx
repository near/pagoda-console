import { AnchorHTMLAttributes, ButtonHTMLAttributes, LabelHTMLAttributes, useRef } from 'react';
import { forwardRef } from 'react';

import type { StitchesCSS, StitchesProps } from '@/styles/stitches';

import { FeatherIcon } from '../FeatherIcon';
import * as S from './styles';
import useDragging from './useDragging';

type Props = StitchesProps<typeof S.Button> & {
  css?: StitchesCSS;
  stableId?: string;
};
type ButtonProps = Props & ButtonHTMLAttributes<HTMLButtonElement>;
type ButtonDropdownProps = Props & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;
type ButtonLinkProps = Props & AnchorHTMLAttributes<HTMLAnchorElement> & { external?: boolean };
type ButtonLabelProps = Props & LabelHTMLAttributes<HTMLLabelElement>;
type ButtonLabelDragAndDropProps = Props & LabelHTMLAttributes<HTMLLabelElement> & {
  handleChange?: (arg0: any) => any;
  onDrop?: (arg0: Array<File>) => void;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, type = 'button', stableId, ...props }, ref) => {
    return (
      <S.Button
        disabled={props.disabled || props.loading === true}
        type={type}
        ref={ref}
        data-stable-id={stableId}
        {...props}
      >
        <S.Content>{children}</S.Content>
      </S.Button>
    );
  },
);
Button.displayName = 'Button';

export const ButtonDropdown = forwardRef<HTMLButtonElement, ButtonDropdownProps>(
  ({ children, color = 'input', stableId, ...props }, ref) => {
    return (
      <S.Button
        color={color}
        disabled={props.disabled || props.loading === true}
        type="button"
        ref={ref}
        data-stable-id={stableId}
        {...props}
      >
        <S.Content css={{ width: '100%' }}>{children}</S.Content>
        <FeatherIcon fill="currentColor" stroke="none" icon="chevron-down" data-icon-arrow />
      </S.Button>
    );
  },
);
ButtonDropdown.displayName = 'ButtonDropdown';

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ children, external, size, stableId, ...props }, ref) => {
    return (
      <S.Button
        as="a"
        ref={ref}
        size={size}
        target={external ? '_blank' : undefined}
        rel={external ? 'noop noreferrer' : undefined}
        data-stable-id={stableId}
        {...props}
      >
        <S.Content>
          {children}
          {external ? <FeatherIcon icon="external-link" size={size === 's' ? 'xs' : 's'} /> : <></>}
        </S.Content>
      </S.Button>
    );
  },
);
ButtonLink.displayName = 'ButtonLink';

export const ButtonLabel = forwardRef<HTMLLabelElement, ButtonLabelProps>(
  ({ children, size, stableId, ...props }, ref) => {
    return (
      <S.Button as="label" ref={ref} size={size} data-stable-id={stableId} tabIndex={0} {...props}>
        <S.Content>{children}</S.Content>
      </S.Button>
    );
  },
);
ButtonLabel.displayName = 'ButtonLabel';

export const ButtonLabelDragAndDrop = forwardRef<HTMLLabelElement, ButtonLabelDragAndDropProps>(
  ({ children, size, stableId, handleChange, onDrop, ...props }, ref) => {
    const labelRef = useRef<HTMLLabelElement>(null);
    useDragging({
      labelRef,
      handleChange,
      onDrop,
    })

    return (
      <S.DragAndDropButton as="label" ref={labelRef} size={size} data-stable-id={stableId} tabIndex={0} {...props}>
        <S.Content>{children}</S.Content>
      </S.DragAndDropButton>
    );
  },
);
ButtonLabel.displayName = 'ButtonLabel';

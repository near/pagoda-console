import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import type { StitchesCSS, StitchesProps } from '@/styles/stitches';

import { FeatherIcon } from '../FeatherIcon';
import * as S from './styles';

type Props = StitchesProps<typeof S.Button> & {
  css?: StitchesCSS;
};
type ButtonProps = Props & ButtonHTMLAttributes<HTMLButtonElement>;
type ButtonDropdownProps = Props & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;
type ButtonLinkProps = Props & AnchorHTMLAttributes<HTMLAnchorElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ children, type = 'button', ...props }, ref) => {
  return (
    <S.Button disabled={props.disabled || props.loading === true} type={type} ref={ref} {...props}>
      <S.Content>{children}</S.Content>
    </S.Button>
  );
});
Button.displayName = 'Button';

export const ButtonDropdown = forwardRef<HTMLButtonElement, ButtonDropdownProps>(
  ({ children, color = 'input', ...props }, ref) => {
    return (
      <S.Button color={color} disabled={props.disabled || props.loading === true} type="button" ref={ref} {...props}>
        <S.Content css={{ width: '100%' }}>{children}</S.Content>
        <FeatherIcon fill="currentColor" stroke="none" icon="chevron-down" data-icon-arrow />
      </S.Button>
    );
  },
);
ButtonDropdown.displayName = 'ButtonDropdown';

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(({ children, ...props }, ref) => {
  return (
    <S.Button as="a" ref={ref} {...props}>
      <S.Content>{children}</S.Content>
    </S.Button>
  );
});
ButtonLink.displayName = 'ButtonLink';

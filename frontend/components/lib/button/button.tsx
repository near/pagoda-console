import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import type { StitchesProps } from '@/styles/stitches';

import * as S from './styles';

type Props = StitchesProps<typeof S.Button>;
type ButtonProps = Props & ButtonHTMLAttributes<HTMLButtonElement>;
type ButtonLinkProps = Props & AnchorHTMLAttributes<HTMLAnchorElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ children, type = 'button', ...props }, ref) => {
  return (
    <S.Button disabled={props.disabled || props.loading === true} type={type} ref={ref} {...props}>
      <S.Content>{children}</S.Content>
    </S.Button>
  );
});
Button.displayName = 'Button';

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(({ children, ...props }, ref) => {
  return (
    <S.Button as="a" ref={ref} {...props}>
      <S.Content>{children}</S.Content>
    </S.Button>
  );
});
ButtonLink.displayName = 'ButtonLink';

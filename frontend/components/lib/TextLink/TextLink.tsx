import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import type { StitchesCSS, StitchesProps } from '@/styles/stitches';

import { FeatherIcon } from '../FeatherIcon';
import * as S from './styles';

type Props = StitchesProps<typeof S.TextLink> & {
  css?: StitchesCSS;
};

type TextLinkProps = Props &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    external?: true;
  };

type TextButtonProps = Props & ButtonHTMLAttributes<HTMLButtonElement>;

export const TextLink = forwardRef<HTMLAnchorElement, TextLinkProps>(({ children, external, ...props }, ref) => {
  return (
    <S.TextLink
      target={external ? '_blank' : undefined}
      rel={external ? 'noop noreferrer' : undefined}
      ref={ref}
      {...props}
    >
      {children}
      {external ? <FeatherIcon icon="external-link" size="xs" /> : <></>}
    </S.TextLink>
  );
});
TextLink.displayName = 'TextLink';

export const TextButton = forwardRef<HTMLButtonElement, TextButtonProps>(
  ({ children, type = 'button', ...props }, ref) => {
    return (
      <S.TextLink as="button" type={type} ref={ref} {...props}>
        {children}
      </S.TextLink>
    );
  },
);
TextButton.displayName = 'TextButton';

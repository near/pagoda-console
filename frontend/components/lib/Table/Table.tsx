import Link from 'next/link';
import type { ComponentProps, HTMLAttributeAnchorTarget, ReactNode } from 'react';
import { forwardRef } from 'react';

import { Placeholder } from '../Placeholder';
import * as S from './styles';

type RootProps = ComponentProps<typeof S.Table>;
type HeadProps = ComponentProps<typeof S.Head> & {
  header?: ReactNode;
};
type RowProps = ComponentProps<typeof S.Row>;
type CellProps = Omit<ComponentProps<typeof S.Cell>, 'link'> & {
  href?: string;
  target?: HTMLAttributeAnchorTarget;
};

export const Body = S.Body;
export const Foot = S.Foot;
export const HeaderCell = S.HeaderCell;

export const Root = forwardRef<HTMLTableElement, RootProps>(({ children, ...props }, ref) => {
  return (
    <S.Table ref={ref} {...props}>
      {children}
    </S.Table>
  );
});
Root.displayName = 'Root';

export const Head = forwardRef<HTMLTableSectionElement, HeadProps>(({ children, header, ...props }, ref) => {
  return (
    <S.Head ref={ref} {...props}>
      {header && (
        <S.Row>
          <S.HeaderCustomCell colSpan={10000}>{header}</S.HeaderCustomCell>
        </S.Row>
      )}

      {children}
    </S.Head>
  );
});
Head.displayName = 'Head';

export const Row = forwardRef<HTMLTableRowElement, RowProps>(({ children, clickable, ...props }, ref) => {
  const role = clickable ? 'button' : undefined;
  const tabIndex = clickable ? 0 : undefined;

  return (
    <S.Row clickable={clickable} role={role} tabIndex={tabIndex} ref={ref} {...props}>
      {children}
    </S.Row>
  );
});
Row.displayName = 'Row';

export const Cell = forwardRef<HTMLTableCellElement, CellProps>(
  ({ children, clickable, href, target, ...props }, ref) => {
    const isButton = clickable && !href;
    const role = isButton ? 'button' : undefined;
    const tabIndex = isButton ? 0 : undefined;

    return (
      <S.Cell clickable={clickable || !!href} link={!!href} role={role} tabIndex={tabIndex} ref={ref} {...props}>
        {href ? (
          <Link href={href} passHref>
            <S.CellAnchor target={target}>{children}</S.CellAnchor>
          </Link>
        ) : (
          children
        )}
      </S.Cell>
    );
  },
);
Cell.displayName = 'Cell';

export function PlaceholderRows() {
  const row = (
    <S.Row>
      <S.Cell colSpan={10000}>
        <Placeholder css={{ width: '100%', height: '1rem' }} />
      </S.Cell>
    </S.Row>
  );

  return (
    <>
      {row}
      {row}
      {row}
    </>
  );
}

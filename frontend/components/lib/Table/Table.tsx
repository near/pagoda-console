import type { ComponentProps, ReactNode } from 'react';
import { forwardRef } from 'react';

import * as S from './styles';

type RootProps = ComponentProps<typeof S.Table>;
type HeadProps = ComponentProps<typeof S.Head> & {
  header?: ReactNode;
};
type RowProps = ComponentProps<typeof S.Row>;
type CellProps = ComponentProps<typeof S.Cell>;

export const Body = S.Body;
export const Foot = S.Foot;
export const HeaderCell = S.HeaderCell;

export const Root = forwardRef<HTMLTableElement, RootProps>(({ children, ...props }, ref) => {
  return (
    <S.Root>
      <S.Table ref={ref} {...props}>
        {children}
      </S.Table>
    </S.Root>
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

export const Cell = forwardRef<HTMLTableCellElement, CellProps>(({ children, clickable, ...props }, ref) => {
  const role = clickable ? 'button' : undefined;
  const tabIndex = clickable ? 0 : undefined;

  return (
    <S.Cell clickable={clickable} role={role} tabIndex={tabIndex} ref={ref} {...props}>
      {children}
    </S.Cell>
  );
});
Cell.displayName = 'Cell';

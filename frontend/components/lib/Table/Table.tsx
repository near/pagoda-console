import type { ComponentProps, ReactNode } from 'react';
import { forwardRef } from 'react';

import * as S from './styles';

type RootProps = ComponentProps<typeof S.Table> & {
  header?: ReactNode;
};
type RowProps = ComponentProps<typeof S.Row>;
type CellProps = ComponentProps<typeof S.Cell>;

export const Head = S.Head;
export const Body = S.Body;
export const HeaderCell = S.HeaderCell;

export const Root = forwardRef<HTMLTableElement, RootProps>(({ children, header, ...props }, ref) => {
  return (
    <S.Root>
      {header && <S.CustomHeader>{header}</S.CustomHeader>}

      <S.Table ref={ref} {...props}>
        {children}
      </S.Table>
    </S.Root>
  );
});
Root.displayName = 'Root';

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

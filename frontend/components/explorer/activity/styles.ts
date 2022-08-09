import { styled } from '@/styles/stitches';

export const TableWrapper = styled('div', {
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  justifyContent: 'center',
  paddingHorizontal: 24,
  borderRadius: 8,
  overflowX: 'auto',
});

export const TableHeader = styled('thead', {
  textTransform: 'uppercase',
  color: 'var(--color-text-3)',
  borderBottom: '1px solid var(--color-border-2)',
  fontSize: 12,
  fontWeight: 600,
});

export const TableHeaderCell = styled('th', {
  padding: '20px 0',
});

export const TableRow = styled('tr', {
  fontSize: 14,
  fontWeight: 500,
  height: 50,

  '& + &': {
    borderTop: '1px solid var(--color-border-2)',
  },
});

export const TableElement = styled('td', {
  verticalAlign: 'top',
  padding: 8,
});

export const Amount = styled('div', {
  fontSize: 14,
  fontWeight: 500,

  variants: {
    direction: {
      income: {
        color: '#10AA7F',
      },
      outcome: {
        color: '#C65454',
      },
    },
  },
});

export const DateTableElement = styled(TableElement, {
  color: 'var(--color-text-3)',
});

export const LinkPrefix = styled('span', { marginRight: 8 });

export const Badge = styled('div', {
  marginRight: 6,
  borderWidth: 1,
  borderRadius: 4,
  display: 'inline-flex',
  borderStyle: 'solid',
  minWidth: 24,
  justifyContent: 'center',
  alignSelf: 'flex-start',
});

export const ActivityAccountName = styled('div', {
  display: 'inline-flex',
});

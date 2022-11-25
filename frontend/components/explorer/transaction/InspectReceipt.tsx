import type { Explorer } from '@pc/common/types/core';
import JSBI from 'jsbi';
import * as React from 'react';
import useSWR from 'swr';

import { useNet } from '@/hooks/net';
import { styled } from '@/styles/stitches';
import * as BI from '@/utils/bigint';
import { fetchApi } from '@/utils/http';

import AccountLink from '../utils/AccountLink';
import BlockLink from '../utils/BlockLink';
import Gas from '../utils/Gas';
import { NearAmount } from '../utils/NearAmount';

type Props = {
  receipt: Explorer.NestedReceiptWithOutcome;
};

const Table = styled('table', {
  width: '100%',
  margin: '24px 0',
});

const TableElement = styled('td', {
  fontSize: 14,
  lineHeight: '175%',
});

const BalanceTitle = styled('div', {
  marginTop: 36,
  fontWeight: 600,
});

const BalanceAmount = styled('div', {
  color: 'var(--color-cta-neutral-highlight_',
});

const getDeposit = (actions: Explorer.Action[]): JSBI => {
  return actions
    .map((action) => ('deposit' in action.args ? JSBI.BigInt(action.args.deposit) : BI.zero))
    .reduce((accumulator, deposit) => JSBI.add(accumulator, deposit), BI.zero);
};
const getGasAttached = (actions: Explorer.Action[]): JSBI => {
  const gasAttached = actions
    .map((action) => action.args)
    .filter(
      (
        args,
      ): args is {
        methodName: string;
        args: string;
        gas: number;
        deposit: string;
      } => 'gas' in args,
    );
  if (gasAttached.length === 0) {
    return BI.zero;
  }
  return gasAttached.reduce((accumulator, args) => JSBI.add(accumulator, JSBI.BigInt(args.gas.toString())), BI.zero);
};

const InspectReceipt: React.FC<Props> = React.memo(({ receipt: { id, ...receipt } }) => {
  const net = useNet();
  const query = useSWR(['explorer/balanceChanges', net, receipt.predecessorId, receipt.receiverId], () =>
    fetchApi(
      [`/explorer/balanceChanges`, { net, receiptId: id, accountIds: [receipt.predecessorId, receipt.receiverId] }],
      true,
    ),
  );
  const predecessorBalance = query.data?.[0];
  const receiverBalance = query.data?.[0];

  const gasAttached = getGasAttached(receipt.actions);
  const refund =
    receipt.outcome.nestedReceipts
      .filter((receipt) => receipt.predecessorId === 'system')
      .reduce((acc, receipt) => JSBI.add(acc, getDeposit(receipt.actions)), BI.zero)
      .toString() ?? '0';

  return (
    <Table>
      <tr>
        <TableElement>Receipt ID</TableElement>
        <TableElement>{id}</TableElement>
      </tr>
      <tr>
        <TableElement>Executed in Block</TableElement>
        <TableElement>
          <BlockLink blockHash={receipt.outcome.block.hash} blockHeight={receipt.outcome.block.height} />
        </TableElement>
      </tr>
      <tr>
        <TableElement>Predecessor ID</TableElement>
        <TableElement>
          <AccountLink accountId={receipt.predecessorId} />
        </TableElement>
      </tr>
      <tr>
        <TableElement>Receiver ID</TableElement>
        <TableElement>
          <AccountLink accountId={receipt.receiverId} />
        </TableElement>
      </tr>
      <tr>
        <TableElement>Attached Gas</TableElement>
        <TableElement>
          <Gas gas={gasAttached} />
        </TableElement>
      </tr>
      <tr>
        <TableElement>Gas Burned</TableElement>
        <TableElement>
          <Gas gas={JSBI.BigInt(receipt.outcome.gasBurnt)} />
        </TableElement>
      </tr>
      <tr>
        <TableElement>Tokens Burned</TableElement>
        <TableElement>
          <NearAmount amount={receipt.outcome.tokensBurnt} decimalPlaces={2} />
        </TableElement>
      </tr>
      <tr>
        <TableElement>Refunded</TableElement>
        <TableElement>
          <NearAmount amount={refund} decimalPlaces={2} />
        </TableElement>
      </tr>
      <tr>
        <TableElement colSpan={2}>
          <BalanceTitle>New Balance</BalanceTitle>
        </TableElement>
      </tr>
      <tr>
        <TableElement>
          <AccountLink accountId={receipt.predecessorId} />
        </TableElement>
        <TableElement>
          <BalanceAmount>
            {predecessorBalance ? <NearAmount amount={predecessorBalance} decimalPlaces={2} /> : '-'}
          </BalanceAmount>
        </TableElement>
      </tr>
      <tr>
        <TableElement>
          <AccountLink accountId={receipt.receiverId} />
        </TableElement>
        <TableElement>
          <BalanceAmount>
            {receiverBalance ? <NearAmount amount={receiverBalance} decimalPlaces={2} /> : '-'}
          </BalanceAmount>
        </TableElement>
      </tr>
    </Table>
  );
});

InspectReceipt.displayName = 'InspectReceipt';

export default InspectReceipt;

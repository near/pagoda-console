import type { Net } from '@pc/database/clients/core';

import { assertUnreachable } from '@/utils/helpers';

import { FeatherIcon } from '../FeatherIcon';

export function SubnetIcon({ net }: { net?: Net }) {
  if (!net) return null;

  switch (net) {
    case 'MAINNET':
      return <FeatherIcon icon="layers" css={{ color: 'var(--color-mainnet)' }} />;
    case 'TESTNET':
      return <FeatherIcon icon="code" css={{ color: 'var(--color-testnet)' }} />;
    default:
      assertUnreachable(net);
  }
}

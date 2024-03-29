import type { Net } from '@pc/database/clients/core';
import type { ComponentProps } from 'react';

import { assertUnreachable } from '@/utils/helpers';

import { FeatherIcon } from '../FeatherIcon';

type FeatherIconProps = ComponentProps<typeof FeatherIcon>;
type Props = Pick<FeatherIconProps, 'size'> & {
  net?: Net;
};

export function SubnetIcon({ net, size }: Props) {
  if (!net) return null;

  switch (net) {
    case 'MAINNET':
      return <FeatherIcon icon="layers" css={{ color: 'var(--color-mainnet)' }} size={size} />;
    case 'TESTNET':
      return <FeatherIcon icon="code" css={{ color: 'var(--color-testnet)' }} size={size} />;
    default:
      assertUnreachable(net);
  }
}

import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { StableId } from '@/utils/stable-ids';

import type { TxFormDepositFormatProps } from './types';

const TxFormDepositFormat = ({ form, nearFormat }: TxFormDepositFormatProps) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Button stableId={StableId.CONTRACT_TRANSACTION_NEAR_FORMAT_DROPDOWN} css={{ width: '9rem' }}>
        {nearFormat}
      </DropdownMenu.Button>
      <DropdownMenu.Content>
        <DropdownMenu.Item onSelect={() => form.setValue('depositFormat', 'NEAR')}>NEAR</DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => form.setValue('depositFormat', 'yoctoⓃ')}>yoctoⓃ</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default TxFormDepositFormat;

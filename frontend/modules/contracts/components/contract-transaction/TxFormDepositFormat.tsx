import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { StableId } from '@/utils/stable-ids';

interface TxFormDepositFormat {
  form: any;
  nearFormat: string;
}

const TxFormDepositFormat = ({ form, nearFormat }: TxFormDepositFormat) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Button stableId={StableId.CONTRACT_TRANSACTION_NEAR_FORMAT_DROPDOWN} css={{ width: '9rem' }}>
        {nearFormat}
      </DropdownMenu.Button>
      <DropdownMenu.Content>
        <DropdownMenu.Item onSelect={() => form.setValue('nearFormat', 'NEAR')}>NEAR</DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => form.setValue('nearFormat', 'yoctoⓃ')}>yoctoⓃ</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default TxFormDepositFormat;

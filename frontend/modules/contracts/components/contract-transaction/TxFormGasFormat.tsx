import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { StableId } from '@/utils/stable-ids';

interface TxFormGasFormat {
  form: any;
  gasFormat: string;
}

const TxFormGasFormat = ({ gasFormat, form }: TxFormGasFormat) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Button stableId={StableId.CONTRACT_TRANSACTION_GAS_FORMAT_DROPDOWN} css={{ width: '9rem' }}>
        {gasFormat}
      </DropdownMenu.Button>
      <DropdownMenu.Content>
        <DropdownMenu.Item onSelect={() => form.setValue('gasFormat', 'Tgas')}>Tgas</DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => form.setValue('gasFormat', 'Ggas')}>Ggas</DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => form.setValue('gasFormat', 'Mgas')}>Mgas</DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => form.setValue('gasFormat', 'gas')}>gas</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default TxFormGasFormat;

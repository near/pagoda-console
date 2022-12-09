import { Controller } from 'react-hook-form';

import * as Form from '@/components/lib/Form';
import { NearInput } from '@/components/lib/NearInput';
import { StableId } from '@/utils/stable-ids';
import { validateInteger, validateMaxNearU128, validateMaxYoctoU128 } from '@/utils/validations';

import type { TxFormDepositProps } from './types';

const TxFormDeposit = ({ form, nearFormat }: TxFormDepositProps) => {
  return (
    <Form.Group>
      <Controller
        name="depositValue"
        control={form.control}
        rules={{
          validate:
            nearFormat === 'yoctoⓃ'
              ? {
                  integer: validateInteger,
                  maxValue: validateMaxYoctoU128,
                }
              : {
                  maxValue: validateMaxNearU128,
                },
        }}
        render={({ field }) => (
          <NearInput
            yocto={nearFormat === 'yoctoⓃ'}
            label="Deposit:"
            field={field}
            isInvalid={!!form.formState.errors.depositValue}
            stableId={StableId.TX_FORM_DEPOSIT_INPUT}
          />
        )}
      />

      <Form.Feedback>{form.formState.errors.depositValue?.message}</Form.Feedback>
    </Form.Group>
  );
};

export default TxFormDeposit;

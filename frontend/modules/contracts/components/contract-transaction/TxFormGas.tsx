import JSBI from 'jsbi';

import { Button } from '@/components/lib/Button';
import * as Form from '@/components/lib/Form';
import { Tooltip } from '@/components/lib/Tooltip';
import * as gasUtils from '@/modules/contracts/utils/convert-gas';
import { styled } from '@/styles/stitches';
import { numberInputHandler } from '@/utils/input-handlers';
import { sanitizeNumber } from '@/utils/sanitize-number';
import { StableId } from '@/utils/stable-ids';

const UseMaxButton = styled(Button, {
  textTransform: 'uppercase',
  position: 'absolute',
  right: 0,
  top: 0,
  color: 'var(--color-primary) !important',
  fontSize: 'var(--font-size-body-small) !important',

  '&:hover': {
    background: 'transparent !important',
  },
  '&:focus': {
    outline: 'none',
  },

  variants: {
    hidden: {
      true: {
        visibility: 'hidden',
      },
    },
  },
});

interface TxFormGas {
  form: any;
  gasFormat: 'Tgas' | 'Ggas' | 'Mgas' | 'gas';
  gas: any;
}

const TxFormGas = ({ form, gasFormat, gas }: TxFormGas) => {
  return (
    <Form.Group>
      <Tooltip content="On NEAR, all unused gas will be refunded after the transaction.">
        <Form.FloatingLabelInput
          type="string"
          label="Gas:"
          isInvalid={!!form.formState.errors.gas}
          onInput={(event) => {
            numberInputHandler(event, { allowComma: false, allowDecimal: false, allowNegative: false });
          }}
          {...form.register(`gas`, {
            setValueAs: (value) => sanitizeNumber(value),
            validate: {
              minValue: (value: string) =>
                JSBI.greaterThan(JSBI.BigInt(value), JSBI.BigInt(0)) ||
                'Value must be greater than 0. Try using 10 Tgas',
              maxValue: (value: string) =>
                JSBI.lessThan(
                  gasUtils.convertGasByFormat(value, gasFormat),
                  JSBI.BigInt(gasUtils.convertGasToTgas('301')),
                ) || 'You can attach a maximum of 300 Tgas to a transaction',
            },
          })}
        />
      </Tooltip>

      <Form.Feedback>{form.formState.errors.gas?.message}</Form.Feedback>

      <UseMaxButton
        stableId={StableId.CONTRACT_TRANSACTION_MAX_GAS_BUTTON}
        color="transparent"
        onClick={() => {
          form.setValue('gas', '300');
          form.setValue('gasFormat', 'Tgas');
        }}
        hidden={Boolean(gas)}
      >
        Use Max
      </UseMaxButton>
    </Form.Group>
  );
};

export default TxFormGas;

import { Controller } from 'react-hook-form';

import * as DropdownMenu from '@/components/lib/DropdownMenu';
import * as Form from '@/components/lib/Form';

interface TxFormSelectFunction {
  form: any;
  functionItems: Array<object>;
}

const TxFormSelectFunction = ({ form, functionItems }) => {
  return (
    <Controller
      name="contractFunction"
      control={form.control}
      rules={{
        required: 'Please select function',
      }}
      render={({ field }) => {
        const contractFunction = functionItems?.find((option: { name: string }) => option.name === field.value);

        return (
          <Form.Group>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Form.FloatingLabelSelect
                  label="Select Function"
                  isInvalid={!!form.formState.errors.contractFunction}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  selection={contractFunction && contractFunction.name}
                />
              </DropdownMenu.Trigger>

              <DropdownMenu.Content align="start" width="trigger">
                <DropdownMenu.RadioGroup value={field.value} onValueChange={(value) => field.onChange(value)}>
                  {functionItems?.map((option: { name: string }) => (
                    <DropdownMenu.RadioItem value={option.name} key={option.name}>
                      {option.name}
                    </DropdownMenu.RadioItem>
                  ))}
                </DropdownMenu.RadioGroup>
              </DropdownMenu.Content>
            </DropdownMenu.Root>

            <Form.Feedback>{form.formState.errors.contractFunction?.message}</Form.Feedback>
          </Form.Group>
        );
      }}
    />
  );
};

export default TxFormSelectFunction;

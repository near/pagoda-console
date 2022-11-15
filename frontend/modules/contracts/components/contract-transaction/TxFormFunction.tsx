import type { AbiParameter } from 'near-abi-client-js';
import { Controller } from 'react-hook-form';

import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H5 } from '@/components/lib/Heading';
import { styled } from '@/styles/stitches';

import resolveAbiDefinition from '../utils/resolveAbiDefinition';

const SectionTitle = styled(H5, {
  userSelect: 'none',
});

const TxFormFunction = ({ form, functionItems, selectedFunction, abi }) => {
  const ParamInput = ({ param }: { param: AbiParameter }) => {
    const resolved = resolveAbiDefinition(abi!, param.type_schema);
    let fieldType;
    let inputTy;
    if (resolved === 'integer') {
      fieldType = 'number';
      inputTy = 'integer';
    } else if (resolved === 'string') {
      fieldType = 'string';
      inputTy = 'string';
    } else {
      fieldType = 'text';
      inputTy = 'JSON';
    }

    return (
      <Form.Group key={param.name}>
        <Form.FloatingLabelInput
          type={fieldType}
          label={`${param.name}: ${inputTy}`}
          {...form.register(`${param.name}`)}
        />
      </Form.Group>
    );
  };

  return (
    <Flex stack>
      <SectionTitle>Function</SectionTitle>

      <Controller
        name="contractFunction"
        control={form.control}
        rules={{
          required: 'Please select function',
        }}
        render={({ field }) => {
          const contractFunction = functionItems?.find((option) => option.name === field.value);

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
                    {functionItems?.map((option) => (
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

      {selectedFunction?.params
        ? selectedFunction?.params.map((param) => <ParamInput key={param.name} param={param} />)
        : null}
    </Flex>
  );
};

export default TxFormFunction;

import type { AbiParameter } from 'near-abi-client-js';

import * as Form from '@/components/lib/Form';

import resolveAbiDefinition from '../utils/resolveAbiDefinition';
import type { paramInputs, TxFormFunctionParamsProps } from './types';

const TxFormFunctionParams = ({ selectedFunction, form, abi }: TxFormFunctionParamsProps) => {
  const params = selectedFunction?.params || [];
  const paramsInputs = params.map((param: AbiParameter) => {
    const resolved = resolveAbiDefinition(abi!, param.type_schema);
    let type;
    let inputTy;
    if (resolved === 'integer') {
      type = 'number';
      inputTy = 'integer';
    } else if (resolved === 'string') {
      type = 'string';
      inputTy = 'string';
    } else {
      type = 'text';
      inputTy = 'JSON';
    }

    return {
      ...param,
      type,
      label: `${param.name}: ${inputTy}`,
    };
  });

  return (
    <>
      {paramsInputs.map((param: paramInputs) => (
        <Form.Group key={param.name}>
          <Form.FloatingLabelInput type={param.type} label={param.label} {...form.register(param.name)} />
        </Form.Group>
      ))}
    </>
  );
};

export default TxFormFunctionParams;

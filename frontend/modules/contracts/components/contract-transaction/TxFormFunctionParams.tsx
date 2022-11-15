import type { AbiParameter } from 'near-abi-client-js';

import * as Form from '@/components/lib/Form';

import resolveAbiDefinition from '../utils/resolveAbiDefinition';

const TxFormFunctionParams = ({ selectedFunction, form, abi }) => {
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

  return selectedFunction?.params ? (
    selectedFunction?.params.map((param) => <ParamInput key={param.name} param={param} />)
  ) : (
    <></>
  );
};

export default TxFormFunctionParams;

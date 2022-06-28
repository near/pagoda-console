import type { ChangeEvent, FocusEvent, Ref } from 'react';

import { mergeRefs } from './merge-refs';

interface InputOptions {
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  ref: Ref<HTMLInputElement>;
  [x: string]: any;
}

export function mergeInputProps(input1: InputOptions, input2: InputOptions): InputOptions {
  return {
    ...input1,
    ...input2,
    onBlur: (event) => {
      input1.onBlur(event);
      input2.onBlur(event);
    },
    onChange: (event) => {
      input1.onChange(event);
      input2.onChange(event);
    },
    ref: mergeRefs([input1.ref, input2.ref]),
  };
}

import type { ChangeEvent, FocusEvent, Ref } from 'react';

import { mergeRefs } from './merge-refs';

interface InputOptions {
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  ref?: Ref<HTMLInputElement>;
  [x: string]: any;
}

export function mergeInputProps(input1: InputOptions, input2: InputOptions): InputOptions {
  const refs: Ref<HTMLInputElement>[] = [];

  if (input1.ref) refs.push(input1.ref);
  if (input2.ref) refs.push(input2.ref);

  return {
    ...input1,
    ...input2,
    onBlur: (event) => {
      input1.onBlur && input1.onBlur(event);
      input2.onBlur && input2.onBlur(event);
    },
    onChange: (event) => {
      input1.onChange && input1.onChange(event);
      input2.onChange && input2.onChange(event);
    },
    ref: mergeRefs(refs),
  };
}

import type { ComponentProps } from 'react';
import { forwardRef, useEffect, useRef, useState } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';

import { convertNearToYocto, convertYoctoToNear } from '@/utils/convert-near';
import { numberInputHandler } from '@/utils/input-handlers';
import { mergeRefs } from '@/utils/merge-refs';
import { sanitizeNumber } from '@/utils/sanitize-number';

import * as Form from '../Form';
import { Tooltip } from '../Tooltip';

type Props = ComponentProps<typeof Form.FloatingLabelInput> & {
  field: ControllerRenderProps<any, any>;
  yocto?: boolean;
};

export const NearInput = forwardRef<HTMLInputElement, Props>(
  ({ field, yocto = false, label, onBlur, onInput, onFocus, placeholder, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>();

    useEffect(() => {
      // This logic syncs the input value when running form.set('myInput', '1234') in the parent

      if (!inputRef.current) return;

      const externalValue = field.value || '';
      const internalValue = sanitizeNumber(inputRef.current.value);

      if (externalValue !== internalValue) {
        inputRef.current.value = externalValue;
      }
    }, [field.value]);

    return (
      <Tooltip
        number
        content={yocto ? convertYoctoToNear(field.value, true) : convertNearToYocto(field.value, true)}
        root={{
          open: isFocused && !!field.value,
        }}
      >
        <Form.FloatingLabelInput
          {...props}
          label={`${label} ${yocto ? '(yoctoⓃ)' : 'Ⓝ'}`}
          placeholder={placeholder || (yocto ? '1,000' : '1.5')}
          isNumber
          onBlur={(event) => {
            setIsFocused(false);
            onBlur && onBlur(event);
          }}
          onChange={(event) => {
            field.onChange(sanitizeNumber(event.currentTarget.value));
          }}
          onInput={(event) => {
            numberInputHandler(event, {
              allowDecimal: !yocto,
            });
            onInput && onInput(event);
          }}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus && onFocus(event);
          }}
          ref={mergeRefs([ref, field.ref, inputRef])}
        />
      </Tooltip>
    );
  },
);
NearInput.displayName = 'NearInput';

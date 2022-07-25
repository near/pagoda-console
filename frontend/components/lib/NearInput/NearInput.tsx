import type { ComponentProps } from 'react';
import { useState } from 'react';
import { forwardRef } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';

import { formatYoctoNear } from '@/utils/format-yocto-near';
import { numberInputHandler } from '@/utils/input-handlers';
import { mergeRefs } from '@/utils/merge-refs';
import { sanitizeNumber } from '@/utils/sanitize-number';

import * as Form from '../Form';
import { Tooltip } from '../Tooltip';

type Props = ComponentProps<typeof Form.FloatingLabelInput> & {
  field: ControllerRenderProps<any, any>;
};

export const NearInput = forwardRef<HTMLInputElement, Props>(
  ({ field, label, onBlur, onInput, onFocus, placeholder, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <Tooltip
        number
        content={formatYoctoNear(field.value)}
        root={{
          open: isFocused && !!field.value,
        }}
      >
        <Form.FloatingLabelInput
          {...props}
          label={`${label} (yoctoⓃ)`}
          placeholder={placeholder || '1,000'}
          isNumber
          onBlur={(event) => {
            setIsFocused(false);
            onBlur && onBlur(event);
          }}
          onChange={(event) => {
            field.onChange(sanitizeNumber(event.currentTarget.value));
          }}
          onInput={(event) => {
            numberInputHandler(event);
            onInput && onInput(event);
          }}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus && onFocus(event);
          }}
          ref={mergeRefs([ref, field.ref])}
        />
      </Tooltip>
    );
  },
);
NearInput.displayName = 'NearInput';

import * as React from 'react';
import type { ControllerRenderProps } from 'react-hook-form';

import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { Text } from '@/components/lib/Text';
import { Tooltip } from '@/components/lib/Tooltip';
import { formRegex } from '@/utils/constants';
import { mergeRefs } from '@/utils/merge-refs';

type Props = React.ComponentProps<typeof Form.Input> & {
  field: ControllerRenderProps<any, any>;
};

const Icon = ({ condition }: { condition: boolean }) => (
  <FeatherIcon icon={condition ? 'check-circle' : 'alert-circle'} color={condition ? 'success' : 'warning'} />
);

export const PasswordInput = React.forwardRef<HTMLInputElement, Props>(
  ({ field, onBlur, onInput, onFocus, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>();

    React.useEffect(() => {
      // This logic syncs the input value when running form.set('myInput', '1234') in the parent

      if (!inputRef.current) return;

      const externalValue = field.value || '';
      const internalValue = inputRef.current.value;

      if (externalValue !== internalValue) {
        inputRef.current.value = externalValue;
      }
    }, [field.value]);

    const passwordValue = field.value;
    const { minLength, containNumber, lowerCase, upperCase, specialCharacter } = formRegex.strongPassword;

    return (
      <Tooltip
        root={{
          open: isFocused && !!passwordValue,
        }}
        content={
          <Flex stack>
            <Text color="current">Your password should contain:</Text>
            <Flex align="center">
              <Icon condition={minLength.test(passwordValue)} /> a minimum of 8 characters
            </Flex>
            <Flex align="center">
              <Icon condition={containNumber.test(passwordValue)} /> at least 1 numeric character
            </Flex>
            <Flex align="center">
              <Icon condition={lowerCase.test(passwordValue)} /> at least 1 lowercase alphabet character
            </Flex>
            <Flex align="center">
              <Icon condition={upperCase.test(passwordValue)} /> at least 1 uppercase alphabet character
            </Flex>
            <Flex align="center">
              <Icon condition={specialCharacter.test(passwordValue)} /> at least 1 special character like !, @, %, &, *
            </Flex>
          </Flex>
        }
      >
        <Form.Input
          {...props}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur && onBlur(event);
          }}
          onChange={(event) => {
            field.onChange(event.currentTarget.value);
          }}
          onInput={(event) => {
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

PasswordInput.displayName = 'PasswordInput';

import type { ComponentProps, ReactNode } from 'react';
import { forwardRef } from 'react';

import { FeatherIcon } from '../FeatherIcon';
import * as S from './styles';

type FeedbackProps = ComponentProps<typeof S.Feedback>;
type FormProps = ComponentProps<typeof S.Form> & {
  disabled?: boolean;
};
type InputProps = Omit<ComponentProps<typeof S.Input>, 'invalid'> & {
  isInvalid?: boolean;
};
type FloatingLabelInputProps = InputProps & {
  label: string;
};
type FloatingLabelSelectProps = Omit<ComponentProps<typeof S.InputButton>, 'invalid'> & {
  isInvalid?: boolean;
  label: string;
  selection?: ReactNode;
};

export const Fieldset = S.Fieldset;
export const HorizontalGroup = S.HorizontalGroup;
export const Group = S.Group;
export const Label = S.Label;
export const LabelDescription = S.LabelDescription;

export const Root = forwardRef<HTMLFormElement, FormProps>(
  ({ children, disabled, noValidate = true, ...props }, ref) => {
    return (
      <S.Form noValidate={noValidate} ref={ref} {...props}>
        <S.Fieldset disabled={disabled}>{children}</S.Fieldset>
      </S.Form>
    );
  },
);
Root.displayName = 'Form';

export const Input = forwardRef<HTMLInputElement, InputProps>(({ isInvalid, type = 'text', ...props }, ref) => {
  return <S.Input invalid={isInvalid} aria-invalid={isInvalid} type={type} ref={ref} {...props} />;
});
Input.displayName = 'Input';

export const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ isInvalid, label, type = 'text', placeholder = ' ', ...props }, ref) => {
    return (
      <S.FloatingWrapper>
        <S.Input
          aria-invalid={isInvalid}
          invalid={isInvalid}
          placeholder={placeholder}
          ref={ref}
          type={type}
          {...props}
        />
        <S.FloatingLabel>{label}</S.FloatingLabel>
      </S.FloatingWrapper>
    );
  },
);
FloatingLabelInput.displayName = 'FloatingLabelInput';

export const FloatingLabelSelect = forwardRef<HTMLButtonElement, FloatingLabelSelectProps>(
  ({ isInvalid, label, selection, ...props }, ref) => {
    return (
      <S.InputButton type="button" floating invalid={isInvalid} aria-invalid={isInvalid} ref={ref} {...props}>
        <S.FloatingLabel shrink={!!selection}>{label}</S.FloatingLabel>
        <S.InputButtonValue>{selection}</S.InputButtonValue>
        <FeatherIcon fill="currentColor" stroke="none" icon="chevron-down" data-icon-arrow />
      </S.InputButton>
    );
  },
);
FloatingLabelSelect.displayName = 'FloatingLabelSelect';

export const Feedback = ({ children, ...props }: FeedbackProps) => {
  if (!children) return null;

  return (
    <S.Feedback role="alert" {...props}>
      {children}
    </S.Feedback>
  );
};

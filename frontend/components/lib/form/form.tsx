import type { ComponentProps } from 'react';
import { forwardRef } from 'react';

import * as S from './form.styles';

type FeedbackProps = ComponentProps<typeof S.Feedback>;
type FormProps = ComponentProps<typeof S.Form> & {
  disabled?: boolean;
};
type InputProps = Omit<ComponentProps<typeof S.Input>, 'invalid'> & {
  isInvalid?: boolean;
};

export const Fieldset = S.Fieldset;
export const Group = S.Group;
export const Label = S.Label;
export const LabelDescription = S.LabelDescription;
export const Legend = S.Legend;

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

export const Feedback = ({ children, ...props }: FeedbackProps) => {
  if (!children) return null;

  return (
    <S.Feedback role="alert" {...props}>
      {children}
    </S.Feedback>
  );
};

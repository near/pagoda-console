import type { ComponentProps, ReactNode } from 'react';
import { useRef } from 'react';
import { forwardRef } from 'react';

import { useBrowserLayoutEffect } from '@/hooks/browser-layout-effect';
import type { StableId } from '@/utils/stable-ids';

import { FeatherIcon } from '../FeatherIcon';
import * as S from './styles';

type FeedbackProps = ComponentProps<typeof S.Feedback>;
type FormProps = ComponentProps<typeof S.Form> & {
  disabled?: boolean;
};
type InputProps = Omit<ComponentProps<typeof S.Input>, 'invalid' | 'number'> & {
  isNumber?: boolean;
  isInvalid?: boolean;
  stableId: StableId;
};
type TextareaProps = Omit<ComponentProps<typeof S.Textarea>, 'invalid'> & {
  isInvalid?: boolean;
  stableId: StableId;
};
type ContentEditableProps = Omit<ComponentProps<typeof S.ContentEditable>, 'invalid'> & {
  isInvalid?: boolean;
  stableId: StableId;
};
type FloatingLabelInputProps = InputProps & {
  children?: ReactNode;
  label: string;
  labelProps?: {
    htmlFor?: string;
    id?: string;
  };
  stableId: StableId;
};
type FloatingLabelSelectProps = Omit<ComponentProps<typeof S.InputButton>, 'invalid'> & {
  isInvalid?: boolean;
  label: string;
  selection?: ReactNode;
  stableId: StableId;
};

export const Fieldset = S.Fieldset;
export const HorizontalGroup = S.HorizontalGroup;
export const Group = S.Group;
export const Label = S.Label;
export const LabelDescription = S.LabelDescription;

export const Root = forwardRef<HTMLFormElement, FormProps>(({ children, noValidate = true, ...props }, ref) => {
  return (
    <S.Form noValidate={noValidate} autoCorrect="off" autoCapitalize="off" ref={ref} {...props}>
      {children}
    </S.Form>
  );
});
Root.displayName = 'Form';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ inputMode, isInvalid, isNumber, stableId, type = 'text', ...props }, ref) => {
    return (
      <S.Input
        aria-invalid={isInvalid}
        inputMode={inputMode || isNumber ? 'decimal' : undefined}
        invalid={isInvalid}
        number={isNumber}
        ref={ref}
        type={type}
        data-stable-id={stableId}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ isInvalid, stableId, ...props }, ref) => {
  return <S.Textarea invalid={isInvalid} aria-invalid={isInvalid} ref={ref} data-stable-id={stableId} {...props} />;
});
Textarea.displayName = 'Textarea';

export const ContentEditable = forwardRef<HTMLDivElement, ContentEditableProps>(
  ({ isInvalid, stableId, ...props }, ref) => {
    return (
      <S.ContentEditable
        contentEditable
        role="textbox"
        invalid={isInvalid}
        suppressContentEditableWarning
        aria-invalid={isInvalid}
        ref={ref}
        data-stable-id={stableId}
        {...props}
      />
    );
  },
);
ContentEditable.displayName = 'ContentEditable';

export const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  (
    {
      children,
      inputMode,
      isInvalid,
      isNumber,
      label,
      labelProps,
      stableId,
      type = 'text',
      placeholder = ' ',
      ...props
    },
    ref,
  ) => {
    /*
      If a placeholder isn't set, we need to use " " as the placeholder (instead of an empty
      string) - this is critical for our CSS to render the label correctly via `:placeholder-shown`.
    */

    const wrapperRef = useRef<HTMLLabelElement | null>(null);

    useBrowserLayoutEffect(() => {
      /*
        When using this component with a custom input via `children`, make sure
        the placeholder attribute is set - this is critical for our CSS to render
        the label correctly via `:placeholder-shown`.
      */
      if (children && wrapperRef.current) {
        const input = wrapperRef.current.querySelector('input');
        if (!input) return;
        input.setAttribute('placeholder', input.getAttribute('placeholder') || placeholder);
      }
    });

    return (
      <S.FloatingWrapper ref={wrapperRef} {...labelProps}>
        {children ? (
          children
        ) : (
          <S.Input
            aria-invalid={isInvalid}
            invalid={isInvalid === true}
            inputMode={inputMode || isNumber ? 'decimal' : undefined}
            number={isNumber === true}
            placeholder={placeholder}
            ref={ref}
            type={type}
            data-stable-id={stableId}
            {...props}
          />
        )}
        <S.FloatingLabel>{label}</S.FloatingLabel>
      </S.FloatingWrapper>
    );
  },
);
FloatingLabelInput.displayName = 'FloatingLabelInput';

export const FloatingLabelSelect = forwardRef<HTMLButtonElement, FloatingLabelSelectProps>(
  ({ isInvalid, label, selection, stableId, ...props }, ref) => {
    return (
      <S.InputButton
        type="button"
        floating
        invalid={isInvalid}
        aria-invalid={isInvalid}
        ref={ref}
        data-stable-id={stableId}
        {...props}
      >
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

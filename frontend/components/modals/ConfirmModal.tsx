import type { ReactNode } from 'react';

import * as Dialog from '@/components/lib/Dialog';
import { StableId } from '@/utils/stable-ids';

import { Button } from '../lib/Button';
import { Flex } from '../lib/Flex';
import { Message } from '../lib/Message';
import { TextButton } from '../lib/TextLink';

interface Props {
  cancelText?: string;
  children: ReactNode;
  confirmColor?: 'primary' | 'danger';
  confirmText?: string;
  errorText?: string | undefined;
  isProcessing?: boolean;
  disabled?: boolean;
  onConfirm?: () => void;
  setErrorText?: (error: string) => void;
  setShow: (show: boolean) => void;
  size?: 's' | 'm';
  show: boolean;
  title: string;
}

export function ConfirmModal(props: Props) {
  const size = props.size || 's';

  return (
    <Dialog.Root open={props.show} onOpenChange={props.setShow}>
      <Dialog.Content title={props.title} size={size}>
        <Flex stack gap="l">
          {props.children}

          <Message
            content={props.errorText}
            type="error"
            dismiss={props.setErrorText ? () => props.setErrorText!('') : undefined}
          />

          <Flex justify="spaceBetween" align="center">
            <Button
              stableId={StableId.CONFIRM_MODAL_CONFIRM_BUTTON}
              loading={props.isProcessing}
              onClick={props.onConfirm}
              color={props.confirmColor || 'primary'}
              disabled={props.disabled}
            >
              {props.confirmText || 'Confirm'}
            </Button>

            <TextButton
              stableId={StableId.CONFIRM_MODAL_CANCEL_BUTTON}
              color="neutral"
              onClick={() => {
                props.setShow(false);
              }}
            >
              {props.cancelText || 'Cancel'}
            </TextButton>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

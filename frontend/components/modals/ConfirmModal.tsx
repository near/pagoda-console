import type { ReactNode } from 'react';

import * as Dialog from '@/components/lib/Dialog';

import { Button } from '../lib/Button';
import { Flex } from '../lib/Flex';
import { Message } from '../lib/Message';

interface Props {
  cancelText?: string;
  children: ReactNode;
  confirmColor?: 'primary' | 'danger';
  confirmText?: string;
  errorText?: string | undefined;
  isProcessing?: boolean;
  onConfirm?: () => void;
  setErrorText?: (error: string) => void;
  setShow: (show: boolean) => void;
  show: boolean;
  title: string;
}

export function ConfirmModal(props: Props) {
  return (
    <Dialog.Root open={props.show} onOpenChange={props.setShow}>
      <Dialog.Content title={props.title} size="small">
        <Flex stack gap="l">
          {props.children}

          <Message
            content={props.errorText}
            type="error"
            dismiss={props.setErrorText ? () => props.setErrorText!('') : undefined}
          />

          <Flex justify="spaceBetween">
            <Button
              color="neutral"
              onClick={() => {
                props.setShow(false);
              }}
            >
              {props.cancelText || 'Cancel'}
            </Button>
            <Button loading={props.isProcessing} onClick={props.onConfirm} color={props.confirmColor || 'primary'}>
              {props.confirmText || 'Confirm'}
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

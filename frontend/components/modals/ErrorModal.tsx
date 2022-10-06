import { useEffect, useState } from 'react';

import * as Dialog from '@/components/lib/Dialog';
import { StableId } from '@/utils/stable-ids';

import { Button } from '../lib/Button';
import { FeatherIcon } from '../lib/FeatherIcon';
import { Flex } from '../lib/Flex';
import { Text } from '../lib/Text';

interface Props {
  error?: string | null;
  setError: (error: string) => void;
}

export const ErrorModal = ({ error, setError }: Props) => {
  const [errorCopy, setErrorCopy] = useState('');

  useEffect(() => {
    if (error) setErrorCopy(error);
    // This copy is needed so the modal doesn't jump while closing due to the error disappearing
  }, [error, errorCopy]);

  function close() {
    setError('');
  }

  return (
    <Dialog.Root open={!!error}>
      <Dialog.Content size="s">
        <Flex stack gap="l" align="center">
          <FeatherIcon icon="alert-circle" color="danger" size="l" />
          <Text size="h5">{errorCopy}</Text>
          <Button stableId={StableId.ERROR_MODAL_DISMISS_BUTTON} color="neutral" onClick={close}>
            Dismiss
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

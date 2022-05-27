import { useEffect, useState } from 'react';

import * as Dialog from '@/components/lib/Dialog';

import { Button } from '../lib/Button';
import { FeatherIcon } from '../lib/FeatherIcon';
import { Flex } from '../lib/Flex';
import { P } from '../lib/Paragraph';

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
      <Dialog.Content size="small">
        <Flex stack gap="l" align="center">
          <FeatherIcon icon="alert-circle" color="danger" size="l" />
          <P size="large">{errorCopy}</P>
          <Button color="neutral" onClick={close}>
            Dismiss
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

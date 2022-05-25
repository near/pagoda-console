import * as Dialog from '@/components/lib/Dialog';

import { Button } from '../lib/Button';
import { FeatherIcon } from '../lib/FeatherIcon';
import { Flex } from '../lib/Flex';
import { P } from '../lib/Paragraph';

interface Props {
  error?: string;
  setError: (error: string) => void;
}

export const ErrorModal = ({ error, setError }: Props) => {
  function close() {
    setError('');
  }

  return (
    <Dialog.Root open={!!error}>
      <Dialog.Content size="small">
        <Flex stack gap="l" align="center">
          <FeatherIcon icon="alert-circle" color="danger" size="l" />
          <P size="large">{error}</P>
          <Button color="neutral" onClick={close}>
            Dismiss
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

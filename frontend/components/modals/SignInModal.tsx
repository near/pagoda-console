import { useCallback } from 'react';

import * as Dialog from '@/components/lib/Dialog';
import { AuthForm } from '@/modules/core/components/AuthForm';

import { Flex } from '../lib/Flex';
import { Text } from '../lib/Text';
import { openToast } from '../lib/Toast';

interface Props {
  description?: string;
  setShow: (show: boolean) => void;
  show: boolean;
  onSignIn?: () => void;
}

export function SignInModal({ description, setShow, show, onSignIn }: Props) {
  const signInHandler = useCallback(() => {
    setShow(false);
    onSignIn && onSignIn();
    openToast({
      type: 'success',
      title: 'Success',
      description: 'You have been signed in.',
    });
  }, [setShow, onSignIn]);

  return (
    <Dialog.Root open={show} onOpenChange={setShow}>
      <Dialog.Content title="Sign In" size="s">
        <Flex stack gap="l">
          {description && <Text>{description}</Text>}
          <AuthForm onSignIn={signInHandler} />
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

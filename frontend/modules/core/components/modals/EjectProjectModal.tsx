import { useCallback, useState } from 'react';

import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { ejectTutorial } from '@/hooks/projects';

interface Props {
  slug: string;
  name: string;
  show: boolean;
  setShow: (show: boolean) => void;
  onEject: () => void;
}

export const EjectProjectModal = ({ slug, name, show, setShow, onEject }: Props) => {
  const [errorText, setErrorText] = useState<string | undefined>();
  const [isEjecting, setIsEjecting] = useState(false);

  async function onConfirm() {
    setIsEjecting(true);
    setErrorText('');

    const success = await ejectTutorial(slug, name);

    if (success) {
      onEject();
      setShow(false);
    } else {
      setErrorText('Something went wrong.');
      setIsEjecting(false);
    }
  }
  const resetError = useCallback(() => setErrorText(''), [setErrorText]);

  return (
    <ConfirmModal
      confirmText="Complete"
      errorText={errorText}
      isProcessing={isEjecting}
      onConfirm={onConfirm}
      resetError={resetError}
      setShow={setShow}
      show={show}
      title={`Complete ${name}`}
    >
      <Flex justify="center" align="center">
        <FeatherIcon icon="book" size="m" />
        <FeatherIcon icon="arrow-right" color="text3" size="s" />
        <FeatherIcon icon="layers" size="m" />
      </Flex>

      <Text>
        Completing this tutorial will turn it into a full project. Doing so will remove the Tutorial from the menu bar
        and create a mainnet API key. This action is irreversible.
      </Text>
    </ConfirmModal>
  );
};

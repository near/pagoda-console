import { useState } from 'react';

import { ejectTutorial } from '@/hooks/projects';

import { FeatherIcon } from '../lib/FeatherIcon';
import { Flex } from '../lib/Flex';
import { P } from '../lib/Paragraph';
import { ConfirmModal } from './ConfirmModal';

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

  return (
    <ConfirmModal
      confirmText="Complete"
      errorText={errorText}
      isProcessing={isEjecting}
      onConfirm={onConfirm}
      setErrorText={setErrorText}
      setShow={setShow}
      show={show}
      title={`Complete ${name}`}
    >
      <Flex justify="center" align="center">
        <FeatherIcon icon="book" size="m" />
        <FeatherIcon icon="arrow-right" color="text3" size="s" />
        <FeatherIcon icon="layers" size="m" />
      </Flex>

      <P>
        Completing this tutorial will turn it into a full project. Doing so will remove the Tutorial from the menu bar
        and create a mainnet API key. This action is irreversible.
      </P>
    </ConfirmModal>
  );
};

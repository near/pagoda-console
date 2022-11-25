import type { Projects } from '@pc/common/types/core';
import { useCallback } from 'react';

import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useMutation } from '@/hooks/mutation';

interface Props {
  slug: Projects.ProjectSlug;
  name: string;
  show: boolean;
  setShow: (show: boolean) => void;
  onEject: () => void;
}

export const EjectProjectModal = ({ slug, name, show, setShow, onEject }: Props) => {
  const ejectTutorialMutation = useMutation('/projects/ejectTutorial', {
    onSuccess: onEject,
    getAnalyticsSuccessData: () => ({ name }),
    getAnalyticsErrorData: () => ({ name }),
  });

  const onConfirm = useCallback(() => ejectTutorialMutation.mutate({ slug }), [ejectTutorialMutation, slug]);

  return (
    <ConfirmModal
      confirmText="Complete"
      errorText={ejectTutorialMutation.status === 'error' ? 'Something went wrong.' : undefined}
      isProcessing={ejectTutorialMutation.isLoading}
      onConfirm={onConfirm}
      resetError={ejectTutorialMutation.reset}
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

import { useForm } from 'react-hook-form';

import { Button, ButtonLink } from '@/components/lib/Button';
import * as Dialog from '@/components/lib/Dialog';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { Text } from '@/components/lib/Text';
import { openToast } from '@/components/lib/Toast';
import { useApiMutation } from '@/hooks/api-mutation';
import { handleMutationError } from '@/utils/error-handlers';
import { StableId } from '@/utils/stable-ids';

export function TransferGithubModal({ setShow, ...props }) {
  return (
    <Dialog.Root open={props.show} onOpenChange={setShow}>
      <Dialog.Content title="Transfer Repository" size="s">
        <ModalContent setShow={setShow} {...props} />
      </Dialog.Content>
    </Dialog.Root>
  );
}

interface TransferRepoData {
  repositorySlug: string;
  newGithubUsername: string;
}

function ModalContent(props) {
  const form = useForm<TransferRepoData>();

  const transferMutation = useApiMutation('/deploys/transferGithubRepository', {
    onSuccess: (res) => {
      openToast({
        type: 'success',
        title: 'Transfer Initiated',
        description: `You must accept the transfer request in your Github email to complete the transfer of ${res.githubRepoFullName}.`,
        duration: 30000,
      });
      props.setShow(false);
    },
    onError: (error: any) => {
      handleMutationError({
        error,
        eventLabel: 'Transfer Github repo',
        eventData: {
          id: props.repository.slug,
        },
        toastTitle: 'Failed to transfer repository',
        toastDescription: errorDescriptionHandler(error),
      });
    },
  });

  const errorDescriptionHandler = (error: any) => {
    switch (error.statusCode) {
      case 400:
        return error.message;
      case 500:
        return 'You have already started the transfer. Please check your email and accept the transfer request.';
      default:
        return 'Unknown error.';
    }
  };

  function transfer(data: TransferRepoData) {
    const newGithubUsername = data.newGithubUsername;

    transferMutation.mutate({
      repositorySlug: props.repository.slug as string,
      newGithubUsername,
    });
  }

  return (
    <Flex stack>
      <Form.Root onSubmit={form.handleSubmit(transfer)}>
        <Flex stack>
          <Text>Transferring this repo will move it to the newly entered GitHub account.</Text>

          <Form.Group>
            <Form.FloatingLabelInput
              label="New Github Username"
              placeholder={'satoshi'}
              stableId={StableId.GALLERY_DEPLOY_TRANSFER_MODAL_REPO_NEW_USER_NAME_INPUT}
              {...form.register('newGithubUsername', {
                required: true,
              })}
            />
          </Form.Group>

          <Button
            stableId={StableId.GALLERY_DEPLOY_TRANSFER_MODAL_CONFIRM_BUTTON}
            type="submit"
            stretch
            loading={transferMutation.isLoading}
          >
            Transfer
          </Button>

          <ButtonLink
            href={`https://www.github.com/${props.repository.githubRepoFullName}`}
            stableId={StableId.GALLERY_DEPLOY_TRANSFER_MODAL_VIEW_REPO_LINK}
            external
            color="neutral"
            stretch
          >
            View Repository
          </ButtonLink>
        </Flex>
      </Form.Root>
    </Flex>
  );
}

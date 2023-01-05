import type { Api } from '@pc/common/types/api';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { TextButton } from '@/components/lib/TextLink';
import { useApiKeys } from '@/hooks/new-api-keys';
import { useTypedMutation } from '@/hooks/typed-mutation';
import { styled } from '@/styles/stitches';
import analytics from '@/utils/analytics';
import { handleMutationError } from '@/utils/error-handlers';
import { StableId } from '@/utils/stable-ids';

type Project = Api.Query.Output<'/projects/getDetails'>;

interface NewKeyFormData {
  description: string;
}

interface Props {
  onClose: () => void;
  project?: Project;
}

const ButtonContainer = styled(Flex, {
  marginTop: '24px',
});

export const CreateApiKeyForm = ({ onClose, project }: Props) => {
  const { mutate: mutateKeys } = useApiKeys(project?.slug);
  const { register, handleSubmit, formState } = useForm<NewKeyFormData>();

  const generateKeyMutation = useTypedMutation('/projects/generateKey', {
    onSuccess: () => {
      onClose();
      mutateKeys();
      analytics.track('DC Create API Key', {
        status: 'success',
      });
    },
    onError: (error) => {
      handleMutationError({
        error,
        eventLabel: 'DC Create API Key',
        toastTitle: 'Failed to create API key.',
      });
    },
  });

  const submit: SubmitHandler<NewKeyFormData> = ({ description }: NewKeyFormData) => {
    if (!project) {
      return;
    }

    generateKeyMutation.mutate({ description, project: project.slug });
  };

  return (
    <Form.Root onSubmit={handleSubmit(submit)}>
      <Form.Group>
        <Form.Label htmlFor="description">Key Description</Form.Label>
        <Form.Input
          id="description"
          isInvalid={!!formState.errors.description}
          stableId={StableId.CREATE_API_KEY_FORM_DESCRIPTION_INPUT}
          {...register('description', {
            required: 'You must enter a description.',
          })}
        />
        <Form.Feedback>{formState.errors.description?.message}</Form.Feedback>
      </Form.Group>
      <ButtonContainer justify="spaceBetween" align="center">
        <Button
          stableId={StableId.CREATE_API_KEY_FORM_CONFIRM_BUTTON}
          onClick={handleSubmit(submit)}
          color={'primary'}
          loading={generateKeyMutation.isLoading}
        >
          Confirm
        </Button>

        <TextButton stableId={StableId.CREATE_API_KEY_FORM_CANCEL_BUTTON} color="neutral" onClick={onClose}>
          Cancel
        </TextButton>
      </ButtonContainer>
    </Form.Root>
  );
};

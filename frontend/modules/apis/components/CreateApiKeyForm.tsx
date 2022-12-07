import type { Api } from '@pc/common/types/api';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { TextButton } from '@/components/lib/TextLink';
import { useMutation } from '@/hooks/mutation';
import { useApiKeys } from '@/hooks/new-api-keys';
import { styled } from '@/styles/stitches';
import { StableId } from '@/utils/stable-ids';

type Project = Api.Query.Output<'/projects/getDetails'>;

interface NewKeyFormData {
  description: string;
}

interface Props {
  close: () => void;
  project?: Project;
}

const ButtonContainer = styled(Flex, {
  marginTop: '24px',
});

export const CreateApiKeyForm = ({ close, project }: Props) => {
  const { mutate: mutateKeys } = useApiKeys(project?.slug);
  const { register, handleSubmit, formState } = useForm<NewKeyFormData>();

  const generateKeyMutation = useMutation('/projects/generateKey', {
    onMutate: close,
    onSuccess: (result) =>
      mutateKeys((prevKeys) => {
        if (!prevKeys) {
          return;
        }
        return [...prevKeys, result];
      }),
    getAnalyticsSuccessData: (variables) => ({ description: variables.description }),
    getAnalyticsErrorData: (variables) => ({ description: variables.description }),
  });
  const submit = useCallback(
    ({ description }: NewKeyFormData) => {
      if (!project) {
        return;
      }
      generateKeyMutation.mutate({ description, project: project.slug });
    },
    [generateKeyMutation, project],
  );

  return (
    <Form.Root onSubmit={handleSubmit(submit)}>
      <Form.Group>
        <Form.Label htmlFor="description">Key Description</Form.Label>
        <Form.Input
          id="description"
          isInvalid={!!formState.errors.description}
          {...register('description', {
            required: 'You must enter a description.',
          })}
        />
        <Form.Feedback>{formState.errors.description?.message}</Form.Feedback>
      </Form.Group>
      <ButtonContainer justify="spaceBetween" align="center">
        <Button stableId={StableId.CREATE_API_KEY_FORM_CONFIRM_BUTTON} onClick={handleSubmit(submit)} color={'primary'}>
          Confirm
        </Button>

        <TextButton stableId={StableId.CREATE_API_KEY_FORM_CANCEL_BUTTON} color="neutral" onClick={close}>
          Cancel
        </TextButton>
      </ButtonContainer>
    </Form.Root>
  );
};

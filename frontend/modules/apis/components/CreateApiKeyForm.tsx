import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { TextButton } from '@/components/lib/TextLink';
import { useMutation } from '@/hooks/mutation';
import { useSureProjectContext } from '@/hooks/project-context';
import { useQueryCache } from '@/hooks/query-cache';
import { styled } from '@/styles/stitches';
import { StableId } from '@/utils/stable-ids';

interface NewKeyFormData {
  description: string;
}

interface Props {
  close: () => void;
}

const ButtonContainer = styled(Flex, {
  marginTop: '24px',
});

export const CreateApiKeyForm = ({ close }: Props) => {
  const { projectSlug } = useSureProjectContext();
  const keysQueryCache = useQueryCache('/projects/getKeys');
  const { register, handleSubmit, formState } = useForm<NewKeyFormData>();
  const generateKeyMutation = useMutation('/projects/generateKey', {
    onMutate: close,
    onSuccess: (result) =>
      keysQueryCache.update({ project: projectSlug }, (prevKeys) => {
        if (!prevKeys) {
          return;
        }
        return [...prevKeys, result];
      }),
    getAnalyticsSuccessData: (variables) => ({ description: variables.description }),
    getAnalyticsErrorData: (variables) => ({ description: variables.description }),
  });
  const submit = useCallback(
    ({ description }: NewKeyFormData) => generateKeyMutation.mutate({ description, project: projectSlug }),
    [generateKeyMutation, projectSlug],
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

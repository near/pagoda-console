import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { TextButton } from '@/components/lib/TextLink';
import { useApiKeys } from '@/hooks/new-api-keys';
import { styled } from '@/styles/stitches';
import analytics from '@/utils/analytics';
import { authenticatedPost } from '@/utils/http';
import type { ApiKey, Project } from '@/utils/types';

interface NewKeyFormData {
  description: ApiKey['description'];
}

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
  project?: Project;
}

const ButtonContainer = styled(Flex, {
  marginTop: '24px',
});

export const ModalContent = ({ show, setShow, project }: Props) => {
  const { mutate: mutateKeys } = useApiKeys(project?.slug);
  const { register, handleSubmit, formState } = useForm<NewKeyFormData>();

  async function createKey(description: string) {
    show && setShow(false);
    try {
      await mutateKeys(async (cachedKeys) => {
        const newKey = await authenticatedPost<ApiKey>('/projects/generateKey', {
          description,
          project: project?.slug,
        });
        analytics.track('DC Create API Key', {
          status: 'success',
          description,
        });
        return cachedKeys ? [...cachedKeys, newKey] : [newKey];
      });
    } catch (e: any) {
      analytics.track('DC Create API Key', {
        status: 'failure',
        description,
        error: e.message,
      });
      throw new Error('Failed to create key');
    }
  }

  return (
    <Form.Root onSubmit={handleSubmit(({ description }) => createKey(description))}>
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
        <Button onClick={handleSubmit(({ description }) => createKey(description))} color={'primary'}>
          Confirm
        </Button>

        <TextButton
          color="neutral"
          onClick={() => {
            setShow(false);
          }}
        >
          Cancel
        </TextButton>
      </ButtonContainer>
    </Form.Root>
  );
};

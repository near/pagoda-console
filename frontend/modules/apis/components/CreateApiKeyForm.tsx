import type { Api } from '@pc/common/types/api';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { TextButton } from '@/components/lib/TextLink';
import { useApiKeys } from '@/hooks/new-api-keys';
import { styled } from '@/styles/stitches';
import analytics from '@/utils/analytics';
import { fetchApi } from '@/utils/http';
import { StableId } from '@/utils/stable-ids';

type Project = Api.Query.Output<'/projects/getDetails'>;

interface NewKeyFormData {
  description: string;
}

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
  project?: Project;
}

const ButtonContainer = styled(Flex, {
  marginTop: '24px',
});

export const CreateApiKeyForm = ({ show, setShow, project }: Props) => {
  const { mutate: mutateKeys } = useApiKeys(project?.slug);
  const { register, handleSubmit, formState } = useForm<NewKeyFormData>();

  async function createKey(description: string) {
    if (!project) {
      return;
    }
    show && setShow(false);
    try {
      await mutateKeys(async (cachedKeys) => {
        const newKey = await fetchApi(['/projects/generateKey', { description, project: project.slug }]);
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
        <Button
          stableId={StableId.CREATE_API_KEY_FORM_CONFIRM_BUTTON}
          onClick={handleSubmit(({ description }) => createKey(description))}
          color={'primary'}
        >
          Confirm
        </Button>

        <TextButton
          stableId={StableId.CREATE_API_KEY_FORM_CANCEL_BUTTON}
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

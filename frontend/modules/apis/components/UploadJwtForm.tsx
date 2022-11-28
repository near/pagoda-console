import type { Api } from '@pc/common/types/api';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { TextButton } from '@/components/lib/TextLink';
import { useApiKeys } from '@/hooks/new-api-keys';
import { styled } from '@/styles/stitches';
import analytics from '@/utils/analytics';
import { authenticatedPost } from '@/utils/http';
import { StableId } from '@/utils/stable-ids';

type Project = Api.Query.Output<'/projects/getDetails'>;

interface NewKeyFormData {
  description: string;
  issuer: string;
  publicKey: string;
}

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
  project?: Project;
}

const ButtonContainer = styled(Flex, {
  marginTop: '24px',
});

export const UploadJwtForm = ({ show, setShow, project }: Props) => {
  const { mutate: mutateKeys } = useApiKeys(project?.slug);
  const { register, handleSubmit, formState } = useForm<NewKeyFormData>();

  async function addKey(description: string, issuer: string, publicKey: string) {
    if (!project) {
      return;
    }
    show && setShow(false);
    try {
      await mutateKeys(async (cachedKeys) => {
        const newKey = await authenticatedPost('/projects/generateKey', {
          description,
          issuer,
          publicKey,
          project: project.slug,
          type: 'JWT',
        });
        analytics.track('DC Add JWT Public Key', {
          status: 'success',
          description,
        });
        return cachedKeys ? [...cachedKeys, newKey] : [newKey];
      });
    } catch (e: any) {
      analytics.track('DC Add JWT Public Key', {
        status: 'failure',
        description,
        error: e.message,
      });
      throw new Error('Failed to add JWT public key');
    }
  }

  return (
    <Form.Root onSubmit={handleSubmit(({ description, issuer, publicKey }) => addKey(description, issuer, publicKey))}>
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

        <Form.Label htmlFor="description">Issuer</Form.Label>
        <Form.Input
          id="issuer"
          isInvalid={!!formState.errors.issuer}
          {...register('issuer', {
            required: 'You must enter an issuer.',
          })}
        />
        <Form.Feedback>{formState.errors.issuer?.message}</Form.Feedback>

        <Form.Label htmlFor="description">Public Key</Form.Label>
        <Form.Input
          id="publicKey"
          isInvalid={!!formState.errors.publicKey}
          {...register('publicKey', {
            required: 'You must enter a public key.',
          })}
        />
        <Form.Feedback>{formState.errors.publicKey?.message}</Form.Feedback>
      </Form.Group>
      <ButtonContainer justify="spaceBetween" align="center">
        <Button
          stableId={StableId.ADD_JWT_KEY_FORM_CONFIRM_BUTTON}
          onClick={handleSubmit(({ description, issuer, publicKey }) => addKey(description, issuer, publicKey))}
          color={'primary'}
        >
          Confirm
        </Button>

        <TextButton
          stableId={StableId.ADD_JWT_KEY_FORM_CANCEL_BUTTON}
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

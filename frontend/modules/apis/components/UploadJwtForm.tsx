import type { Api } from '@pc/common/types/api';
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
  issuer: string;
  publicKey: string;
}

interface Props {
  close: () => void;
  project?: Project;
}

const ButtonContainer = styled(Flex, {
  marginTop: '24px',
});

export const UploadJwtForm = ({ close, project }: Props) => {
  const { mutate: mutateKeys } = useApiKeys(project?.slug);
  const { register, handleSubmit, formState } = useForm<NewKeyFormData>();

  const addJwtKeyMutation = useMutation('/projects/addJwtKey', {
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

  const submit = async ({ description, issuer, publicKey }: NewKeyFormData) => {
    if (!project) {
      return;
    }
    addJwtKeyMutation.mutate({ description, project: project.slug, issuer, publicKey });
  };

  return (
    <Form.Root onSubmit={handleSubmit(submit)}>
      <Flex stack>
        <Form.Group>
          <Form.Label htmlFor="description">Key Description</Form.Label>
          <Form.Input
            id="description"
            stableId={StableId.ADD_JWT_KEY_FORM_DESCRIPTION_INPUT}
            isInvalid={!!formState.errors.description}
            {...register('description', {
              required: 'You must enter a description.',
            })}
          />
          <Form.Feedback>{formState.errors.description?.message}</Form.Feedback>
        </Form.Group>
        <Form.Group>
          <Form.Label htmlFor="issuer">Issuer</Form.Label>
          <Form.Input
            id="issuer"
            stableId={StableId.ADD_JWT_KEY_FORM_ISSUER_INPUT}
            isInvalid={!!formState.errors.issuer}
            placeholder="https://jwt.issuer"
            {...register('issuer', {
              required: 'You must enter an issuer.',
            })}
          />
          <Form.Feedback>{formState.errors.issuer?.message}</Form.Feedback>
        </Form.Group>
        <Form.Group>
          <Form.Label htmlFor="publicKey">Public Key</Form.Label>
          <Form.Textarea
            id="publicKey"
            stableId={StableId.ADD_JWT_KEY_FORM_PUBLIC_KEY_INPUT}
            isInvalid={!!formState.errors.publicKey}
            placeholder={`-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----`}
            {...register('publicKey', {
              required: 'You must enter a public key.',
            })}
          />
          <Form.Feedback>{formState.errors.publicKey?.message}</Form.Feedback>
        </Form.Group>
      </Flex>
      <ButtonContainer justify="spaceBetween" align="center">
        <Button stableId={StableId.ADD_JWT_KEY_FORM_CONFIRM_BUTTON} onClick={handleSubmit(submit)} color={'primary'}>
          Confirm
        </Button>

        <TextButton stableId={StableId.ADD_JWT_KEY_FORM_CANCEL_BUTTON} color="neutral" onClick={close}>
          Cancel
        </TextButton>
      </ButtonContainer>
    </Form.Root>
  );
};

import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { TextButton } from '@/components/lib/TextLink';
import { openToast } from '@/components/lib/Toast';
import analytics from '@/utils/analytics';
import { formRegex } from '@/utils/constants';
import { authenticatedPost } from '@/utils/http';
import type { Contract, Environment, Project } from '@/utils/types';

interface Props {
  project: Project;
  environment: Environment;
  onAdd: (contract: Contract) => void;
  onCancel: () => void;
}

interface FormData {
  contractAddress: string;
}

export function AddContractForm(props: Props) {
  const { register, handleSubmit, formState } = useForm<FormData>();

  const environmentTitle = props.environment?.net === 'TESTNET' ? 'Testnet' : 'Mainnet';
  const environmentTla = props.environment?.net === 'TESTNET' ? 'testnet' : 'near';

  const submitForm: SubmitHandler<FormData> = async ({ contractAddress }) => {
    try {
      const contract: Contract = await authenticatedPost('/projects/addContract', {
        project: props.project.slug,
        environment: props.environment.subId,
        address: contractAddress,
      });

      analytics.track('DC Add Contract', {
        status: 'success',
        contractId: contractAddress,
        net: props.environment.subId === 2 ? 'MAINNET' : 'TESTNET',
      });

      openToast({
        type: 'success',
        title: 'Contract Added',
        description: contract.address,
      });

      props.onAdd(contract);

      return contract;
    } catch (e: any) {
      if (e.message === 'DUPLICATE_CONTRACT_ADDRESS') {
        openToast({
          type: 'error',
          title: 'Duplicate Contract',
          description: 'This contract has already been saved to your project.',
        });
        return;
      }

      if (e.message === 'ADDRESS_NOT_FOUND') {
        const net = props.environment.net.toLowerCase();
        openToast({
          type: 'error',
          title: 'Contract not found',
          description: `Contract ${contractAddress} was not found on ${net}.`,
        });
        return;
      }
      console.error(e);
      analytics.track('DC Add Contract', {
        status: 'failure',
        error: e.message,
        contractId: contractAddress,
        net: props.environment.subId === 2 ? 'MAINNET' : 'TESTNET',
      });

      openToast({
        type: 'error',
        title: 'Failed to add contract.',
      });
    }
  };

  return (
    <Form.Root disabled={formState.isSubmitting} onSubmit={handleSubmit(submitForm)}>
      <Flex stack gap="l">
        <Form.Group maxWidth="m">
          <Form.FloatingLabelInput
            label={`${environmentTitle} Address`}
            isInvalid={!!formState.errors.contractAddress}
            placeholder={`pagoda.${environmentTla}`}
            {...register('contractAddress', {
              required: 'Address field is required',
              minLength: {
                value: 2,
                message: 'Address must be at least 2 characters',
              },
              maxLength: {
                value: 64,
                message: 'Address must be 64 characters or less',
              },
              pattern: {
                value: formRegex.contractAddress,
                message: 'Invalid address format.',
              },
            })}
          />
          <Form.Feedback>{formState.errors.contractAddress?.message}</Form.Feedback>
        </Form.Group>

        <Flex justify="spaceBetween" align="center">
          <Button type="submit" loading={formState.isSubmitting}>
            Confirm
          </Button>
          <TextButton color="neutral" onClick={props.onCancel}>
            Cancel
          </TextButton>
        </Flex>
      </Flex>
    </Form.Root>
  );
}

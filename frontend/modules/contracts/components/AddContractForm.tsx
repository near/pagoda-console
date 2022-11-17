import type { Explorer } from '@pc/common/types/core';
import { useCallback, useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { ContractTemplateDetails } from '@/components/contract-templates/ContractTemplateDetails';
import { ContractTemplateList } from '@/components/contract-templates/ContractTemplateList';
import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { HR } from '@/components/lib/HorizontalRule';
import { Text } from '@/components/lib/Text';
import { TextButton } from '@/components/lib/TextLink';
import { openToast } from '@/components/lib/Toast';
import type { ContractTemplate } from '@/hooks/contract-templates';
import { useMutation } from '@/hooks/mutation';
import { useSureProjectContext } from '@/hooks/project-context';
import { formRegex } from '@/utils/constants';
import { deployContractTemplate } from '@/utils/deploy-contract-template';
import { StableId } from '@/utils/stable-ids';

interface Props {
  onAdd: () => void;
}

interface FormData {
  contractAddress: Explorer.AccountId;
}

export function AddContractForm(props: Props) {
  const { register, handleSubmit, formState, setValue } = useForm<FormData>();
  const [selectedContractTemplate, setSelectedContractTemplate] = useState<ContractTemplate | undefined>();
  const { projectSlug, environmentSubId, updateContext: updateProjectContext } = useSureProjectContext();

  const environmentTitle = environmentSubId === 1 ? 'Testnet' : 'Mainnet';
  const environmentTla = environmentSubId === 1 ? 'testnet' : 'near';

  const deployContractMutation = useMutation('/abi/addContractAbi', {
    onSuccess: (_result, variables) => {
      openToast({
        type: 'success',
        title: 'Contract Deployed',
        description: variables.contract,
      });
      updateProjectContext(projectSlug, 1); // Make sure TESTNET is selected if they happened to currently be on MAINNET
      props.onAdd();
    },
    onError: () => {
      openToast({
        type: 'error',
        title: 'Failed to deploy example contract.',
      });
    },
    getAnalyticsSuccessData: (variables) => ({ address: variables.contract }),
    getAnalyticsErrorData: (variables) => ({ address: variables.contract }),
  });

  const addContractMutation = useMutation('/projects/addContract', {
    onSuccess: (contract) => {
      openToast({
        type: 'success',
        title: 'Contract Added',
        description: contract.address,
      });
      props.onAdd();
    },
    getAnalyticsSuccessData: (variables) => ({
      contractId: variables.address,
      net: variables.environment === 2 ? 'MAINNET' : 'TESTNET',
    }),
    onError: (e, variables) => {
      switch ((e as any).message) {
        case 'DUPLICATE_CONTRACT_ADDRESS':
          openToast({
            type: 'error',
            title: 'Duplicate Contract',
            description: 'This contract has already been saved to your project.',
          });
          break;
        case 'ADDRESS_NOT_FOUND':
          openToast({
            type: 'error',
            title: 'Contract not found',
            description: `Contract ${variables.address} was not found on ${
              variables.environment === 2 ? 'mainnet' : 'testnet'
            }.`,
          });
          break;
        default:
          openToast({
            type: 'error',
            title: 'Failed to add contract.',
          });
      }
    },
    getAnalyticsErrorData: (variables, error) => ({
      error: (error as any).message,
      contractId: variables.address,
      net: variables.environment === 2 ? 'MAINNET' : 'TESTNET',
    }),
  });

  const submitForm: SubmitHandler<FormData> = ({ contractAddress }) =>
    addContractMutation.mutate({
      address: contractAddress.trim() as Explorer.AccountId,
      project: projectSlug,
      environment: environmentSubId,
    });

  const deployContract = useCallback(
    async (template: ContractTemplate) => {
      const accountId = await deployContractTemplate(template);
      const environmentSubId = 1; // Only TESTNET is supported for now
      await addContractMutation.mutateAsync({
        address: accountId,
        project: projectSlug,
        environment: environmentSubId,
      });
    },
    [addContractMutation, projectSlug],
  );

  return (
    <Flex stack gap="l">
      {selectedContractTemplate ? (
        <>
          <TextButton
            stableId={StableId.ADD_CONTRACT_FORM_TEMPLATE_BACK_BUTTON}
            onClick={() => setSelectedContractTemplate(undefined)}
          >
            <FeatherIcon icon="arrow-left" /> Back
          </TextButton>
          <ContractTemplateDetails
            template={selectedContractTemplate}
            onSelect={deployContract}
            isDeploying={deployContractMutation.isLoading}
          />
        </>
      ) : (
        <>
          <Text>Enter a contract address, or select an example contract from the list below.</Text>

          <Form.Root disabled={formState.isSubmitting} onSubmit={handleSubmit(submitForm)}>
            <Flex stack>
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
                  onChange={(e) => setValue('contractAddress', e.target.value.trim() as Explorer.AccountId)}
                />
                <Form.Feedback>{formState.errors.contractAddress?.message}</Form.Feedback>
              </Form.Group>

              <Button
                stableId={StableId.ADD_CONTRACT_FORM_CONFIRM_BUTTON}
                type="submit"
                loading={formState.isSubmitting}
                stretch
              >
                Add
              </Button>
            </Flex>
          </Form.Root>

          <Flex align="center">
            <HR />
            <Text css={{ whiteSpace: 'nowrap' }}>or</Text>
            <HR />
          </Flex>

          <ContractTemplateList noThumbnails onSelect={(template) => setSelectedContractTemplate(template)} />
        </>
      )}
    </Flex>
  );
}

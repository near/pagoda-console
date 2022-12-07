import type { Api } from '@pc/common/types/api';
import { useCallback, useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { mutate } from 'swr';

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
import { useProjectSelector } from '@/hooks/selected-project';
import { formRegex } from '@/utils/constants';
import { deployContractTemplate } from '@/utils/deploy-contract-template';
import { mapEnvironmentSubIdToNet } from '@/utils/helpers';
import { StableId } from '@/utils/stable-ids';

type Project = Api.Query.Output<'/projects/getDetails'>;
type Environment = Api.Query.Output<'/projects/getEnvironments'>[number];
type Contract = Api.Query.Output<'/projects/getContracts'>[number];

interface Props {
  project: Project;
  environment: Environment;
  onAdd: () => void;
}

interface FormData {
  contractAddress: string;
}

export function AddContractForm({ onAdd, project, environment }: Props) {
  const { register, handleSubmit, formState, setValue } = useForm<FormData>();
  const [selectedContractTemplate, setSelectedContractTemplate] = useState<ContractTemplate | undefined>();
  const { selectEnvironment } = useProjectSelector();

  const environmentTitle = environment?.net === 'TESTNET' ? 'Testnet' : 'Mainnet';
  const environmentTla = environment?.net === 'TESTNET' ? 'testnet' : 'near';

  const onContractAdd = useCallback(
    (contract: Contract) => {
      if (!project) {
        return;
      }
      mutate<Contract[]>(
        ['/projects/getContracts', project.slug, environment.subId],
        (contracts) => contracts && [...contracts, contract],
      );
      onAdd?.();
    },
    [project, environment, onAdd],
  );

  const deployContractMutation = useMutation('/projects/addContract', {
    onSuccess: (result, variables) => {
      openToast({
        type: 'success',
        title: 'Contract Deployed',
        description: variables.address,
      });
      selectEnvironment(project.slug, 1); // Make sure TESTNET is selected if they happened to currently be on MAINNET
      onContractAdd(result);
    },
    onError: () => {
      openToast({
        type: 'error',
        title: 'Failed to deploy example contract.',
      });
    },
    getAnalyticsSuccessData: (variables) => ({ address: variables.address }),
    getAnalyticsErrorData: (variables) => ({ address: variables.address }),
  });

  const addContractMutation = useMutation('/projects/addContract', {
    onSuccess: (contract) => {
      openToast({
        type: 'success',
        title: 'Contract Added',
        description: contract.address,
      });
      onContractAdd(contract);
    },
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
            description: `Contract ${variables.address} was not found on ${mapEnvironmentSubIdToNet(
              variables.environment,
            ).toLowerCase()}.`,
          });
          break;
        default:
          openToast({
            type: 'error',
            title: 'Failed to add contract.',
          });
      }
    },
    getAnalyticsSuccessData: (variables) => ({
      contractId: variables.address,
      net: mapEnvironmentSubIdToNet(variables.environment),
    }),
    getAnalyticsErrorData: (variables, error) => ({
      error: (error as any).message,
      contractId: variables.address,
      net: mapEnvironmentSubIdToNet(variables.environment),
    }),
  });

  const submitForm: SubmitHandler<FormData> = ({ contractAddress }) => {
    addContractMutation.mutate({
      address: contractAddress.trim(),
      project: project.slug,
      environment: environment.subId,
    });
  };

  const deployContract = useCallback(
    async (template: ContractTemplate) => {
      const { environmentSubId, address } = await deployContractTemplate(template);
      deployContractMutation.mutate({
        address,
        project: project.slug,
        environment: environmentSubId,
      });
    },
    [deployContractMutation, project.slug],
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

          <Form.Root disabled={addContractMutation.isLoading} onSubmit={handleSubmit(submitForm)}>
            <Flex stack>
              <Form.Group maxWidth="m">
                <Form.FloatingLabelInput
                  label={`${environmentTitle} Address`}
                  isInvalid={!!formState.errors.contractAddress}
                  placeholder={`pagoda.${environmentTla}`}
                  stableId={StableId.ADD_CONTRACT_FORM_ADDRESS_INPUT}
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
                  onChange={(e) => setValue('contractAddress', e.target.value.trim())}
                />
                <Form.Feedback>{formState.errors.contractAddress?.message}</Form.Feedback>
              </Form.Group>

              <Button
                stableId={StableId.ADD_CONTRACT_FORM_CONFIRM_BUTTON}
                type="submit"
                loading={addContractMutation.isLoading}
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

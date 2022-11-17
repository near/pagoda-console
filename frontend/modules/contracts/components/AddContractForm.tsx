import type { Api } from '@pc/common/types/api';
import type { Explorer } from '@pc/common/types/core';
import { useState } from 'react';
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
import { useSureProjectContext } from '@/hooks/project-context';
import analytics from '@/utils/analytics';
import { formRegex } from '@/utils/constants';
import { deployContractTemplate } from '@/utils/deploy-contract-template';
import { mapEnvironmentSubIdToNet } from '@/utils/helpers';
import { authenticatedPost } from '@/utils/http';
import { StableId } from '@/utils/stable-ids';

type Contract = Api.Query.Output<'/projects/getContracts'>[number];

interface Props {
  onAdd: (contract: Contract) => void;
}

interface FormData {
  contractAddress: Explorer.AccountId;
}

export function AddContractForm(props: Props) {
  const { register, handleSubmit, formState, setValue } = useForm<FormData>();
  const [isDeployingContract, setIsDeployingContract] = useState(false);
  const [selectedContractTemplate, setSelectedContractTemplate] = useState<ContractTemplate | undefined>();
  const { projectSlug, environmentSubId, updateContext: updateProjectContext } = useSureProjectContext();

  const environmentTitle = environmentSubId === 1 ? 'Testnet' : 'Mainnet';
  const environmentTla = environmentSubId === 1 ? 'testnet' : 'near';

  async function deployContract(template: ContractTemplate) {
    try {
      setIsDeployingContract(true);

      const contract = await deployContractTemplate(projectSlug, template);

      analytics.track('DC Deploy Contract Template', {
        status: 'success',
        name: template.title,
      });

      openToast({
        type: 'success',
        title: 'Contract Deployed',
        description: contract.address,
      });

      updateProjectContext(projectSlug, 1); // Make sure TESTNET is selected if they happened to currently be on MAINNET

      props.onAdd(contract);
    } catch (e: any) {
      setIsDeployingContract(false);

      analytics.track('DC Deploy Contract Template', {
        status: 'failure',
        name: template.title,
      });

      console.error(e);

      openToast({
        type: 'error',
        title: 'Failed to deploy example contract.',
      });
    }
  }

  const submitForm: SubmitHandler<FormData> = async ({ contractAddress }) => {
    const contractAddressValue = contractAddress.trim() as Explorer.AccountId;
    try {
      const contract = await authenticatedPost('/projects/addContract', {
        project: projectSlug,
        environment: environmentSubId,
        address: contractAddressValue,
      });

      analytics.track('DC Add Contract', {
        status: 'success',
        contractId: contractAddressValue,
        net: environmentSubId === 2 ? 'MAINNET' : 'TESTNET',
      });

      openToast({
        type: 'success',
        title: 'Contract Added',
        description: contract.address,
      });

      props.onAdd(contract);
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
        const net = mapEnvironmentSubIdToNet(environmentSubId).toLowerCase();
        openToast({
          type: 'error',
          title: 'Contract not found',
          description: `Contract ${contractAddressValue} was not found on ${net}.`,
        });
        return;
      }
      console.error(e);
      analytics.track('DC Add Contract', {
        status: 'failure',
        error: e.message,
        contractId: contractAddressValue,
        net: environmentSubId === 2 ? 'MAINNET' : 'TESTNET',
      });

      openToast({
        type: 'error',
        title: 'Failed to add contract.',
      });
    }
  };

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
            isDeploying={isDeployingContract}
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

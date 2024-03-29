import type { Api } from '@pc/common/types/api';
import { useEffect, useState } from 'react';

import { Card } from '@/components/lib/Card';
import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Spinner } from '@/components/lib/Spinner';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { openToast } from '@/components/lib/Toast';
import { usePublicMode } from '@/hooks/public';
import ContractTransaction from '@/modules/contracts/components/contract-transaction';
import { UploadContractAbi } from '@/modules/contracts/components/UploadContractAbi';
import { useAnyAbi } from '@/modules/contracts/hooks/abi';
import { StableId } from '@/utils/stable-ids';

type Contract = Api.Query.Output<'/projects/getContract'>;

interface Props {
  contract?: Contract;
}

export const ContractInteract = ({ contract }: Props) => {
  const { publicModeIsActive } = usePublicMode();
  const [abiUploaded, setAbiUploaded] = useState<boolean | undefined>(undefined);
  const { embeddedQuery, privateQuery } = useAnyAbi(contract);
  const error = embeddedQuery.error || privateQuery.error;
  const abi = embeddedQuery.data || privateQuery.data;
  const isValidating = embeddedQuery.isValidating || privateQuery.isValidating;

  useEffect(() => {
    if (abi) {
      setAbiUploaded(true);
    } else if (!isValidating && error?.message === 'ABI_NOT_FOUND') {
      setAbiUploaded(false);
    } else {
      setAbiUploaded(undefined);
    }
  }, [abi, isValidating, error]);

  useEffect(() => {
    if (error && error.message && ['Failed to fetch', 'ABI_NOT_FOUND'].indexOf(error.message) < 0) {
      openToast({
        type: 'error',
        title: 'Failed to retrieve ABI.',
      });
    }
  }, [error]);

  function onAbiUpload() {
    embeddedQuery.mutate();
    privateQuery.mutate();
  }

  if (!contract || abiUploaded === undefined) {
    return (
      <Container size="s">
        <Flex stack align="center">
          <Spinner size="m" />
        </Flex>
      </Container>
    );
  }

  if (abiUploaded) {
    return <ContractTransaction contract={contract} />;
  }
  if (publicModeIsActive) {
    return (
      <Card>
        <Flex align="center" gap="l">
          <FeatherIcon icon="alert-circle" size="m" color="warning" />

          <Text>
            This contract doesn&apos;t appear to have an{' '}
            <TextLink
              stableId={StableId.CONTRACT_INTERACT_NEAR_ABI_DOCS_LINK}
              href="https://github.com/near/abi"
              external
            >
              embedded ABI
            </TextLink>
            . To interact with this contract, ask the owner of this contract to deploy an embedded ABI.
          </Text>
        </Flex>
      </Card>
    );
  }

  return <UploadContractAbi contractSlug={contract.slug} onUpload={onAbiUpload} />;
};

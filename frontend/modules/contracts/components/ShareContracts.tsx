import type { Api } from '@pc/common/types/api';
import type { ChangeEvent } from 'react';
import { useState } from 'react';

import { Button } from '@/components/lib/Button';
import { Checkbox, CheckboxGroup } from '@/components/lib/Checkbox';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H5 } from '@/components/lib/Heading';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { openToast } from '@/components/lib/Toast';
import { Tooltip } from '@/components/lib/Tooltip';
import { useMaybeProjectContext } from '@/hooks/project-context';
import analytics from '@/utils/analytics';
import { mapEnvironmentSubIdToNet } from '@/utils/helpers';
import { StableId } from '@/utils/stable-ids';

import { useEmbeddedAbi } from '../hooks/abi';

type Contract = Api.Query.Output<'/projects/getContract'>;

interface Props {
  contracts: Contract[];
}

export function ShareContracts({ contracts }: Props) {
  const { environmentSubId } = useMaybeProjectContext();
  const deviceSupportsSharing = !!navigator.share;
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);

  function copyLink() {
    const url = returnUrl();

    navigator.clipboard.writeText(url);

    openToast({
      type: 'success',
      title: 'Link copied to clipboard.',
    });

    analytics.track('DC Share Contracts: Copied URL', {
      addresses: selectedAddresses.join(','),
      url,
    });
  }

  async function shareLink() {
    const url = returnUrl();

    try {
      await navigator.share({
        url,
      });
    } catch (e) {
      console.log(e);
    }

    analytics.track('DC Share Contracts: Shared URL', {
      addresses: selectedAddresses.join(','),
      url,
    });
  }

  function onCheckboxChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelectedAddresses((addresses) => {
        return [...addresses, e.target.value];
      });

      analytics.track('DC Share Contracts: Contract Selected', {
        address: e.target.value,
      });
    } else {
      setSelectedAddresses((addresses) => {
        return addresses.filter((a) => a !== e.target.value);
      });

      analytics.track('DC Share Contracts: Contract Deselected', {
        address: e.target.value,
      });
    }
  }

  if (!environmentSubId) {
    return null;
  }
  const net = mapEnvironmentSubIdToNet(environmentSubId);

  function returnUrl() {
    const host = `${window.location.protocol}//${window.location.host}`;
    const url = `${host}/public/contracts?net=${net}&addresses=${selectedAddresses.join(',')}&shared=true`;
    return url;
  }

  return (
    <Flex stack gap="l">
      <Text>
        Sharing will allow users to view analytics and interact with the selected contracts. A shared contract can only
        be interacted with if it has an{' '}
        <TextLink stableId={StableId.SHARE_CONTRACTS_NEAR_ABI_DOCS_LINK} href="https://github.com/near/abi" external>
          embedded ABI
        </TextLink>
      </Text>

      <Flex stack>
        <H5>1. Select {net.toLowerCase()} Contracts</H5>

        <CheckboxGroup aria-label="Select contracts to share" css={{ width: '100%' }}>
          {contracts.map((c) => (
            <ContractCheckbox key={c.address} contract={c} onChange={onCheckboxChange} />
          ))}
        </CheckboxGroup>
      </Flex>

      <Flex stack>
        <H5>2. Share the Link</H5>

        <Flex align="center">
          <Button
            color="neutral"
            disabled={selectedAddresses.length === 0}
            stableId={StableId.SHARE_CONTRACTS_COPY_LINK_BUTTON}
            css={{ flexGrow: 1 }}
            onClick={copyLink}
          >
            <FeatherIcon icon="link" color="primary" /> Copy Link
          </Button>

          {deviceSupportsSharing && (
            <Button
              color="neutral"
              aria-label="Share Link"
              disabled={selectedAddresses.length === 0}
              stableId={StableId.SHARE_CONTRACTS_SEND_LINK_BUTTON}
              onClick={shareLink}
            >
              <FeatherIcon icon="share-2" color="primary" />
            </Button>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}

function ContractCheckbox({
  contract,
  onChange,
}: {
  contract: Contract;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const abiQuery = useEmbeddedAbi(contract);

  function abiIconHover() {
    analytics.track('DC Share Contracts: ABI Icon Hover', {
      address: contract.address,
      hasEmbeddedAbi: Boolean(abiQuery.data),
    });
  }

  return (
    <Checkbox
      key={contract.address}
      value={contract.address}
      name={`sharedContracts-${contract.address}`}
      onChange={onChange}
    >
      <Flex as="span" align="center">
        <Text color="text1" css={{ marginRight: 'auto' }}>
          {contract.address}
        </Text>

        {abiQuery.data && (
          <Tooltip content="Embedded ABI">
            <span>
              <FeatherIcon icon="file-text" color="primary" onMouseEnter={abiIconHover} />
            </span>
          </Tooltip>
        )}

        {abiQuery.data === null && (
          <Tooltip content="No embedded ABI">
            <span>
              <FeatherIcon icon="alert-circle" color="warning" onMouseEnter={abiIconHover} />
            </span>
          </Tooltip>
        )}
      </Flex>
    </Checkbox>
  );
}

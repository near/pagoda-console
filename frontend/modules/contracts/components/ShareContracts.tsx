import type { ChangeEvent } from 'react';
import { useState } from 'react';

import { Button } from '@/components/lib/Button';
import { Checkbox, CheckboxGroup } from '@/components/lib/Checkbox';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H5 } from '@/components/lib/Heading';
import { Text } from '@/components/lib/Text';
import { openToast } from '@/components/lib/Toast';
import analytics from '@/utils/analytics';
import { StableId } from '@/utils/stable-ids';
import type { Contract, Environment } from '@/utils/types';

interface Props {
  contracts: Contract[];
  environment: Environment;
}

export function ShareContracts({ contracts, environment }: Props) {
  const deviceSupportsSharing = !!navigator.share;
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);

  function copyLink() {
    const url = returnUrl();

    navigator.clipboard.writeText(url);

    openToast({
      type: 'success',
      title: 'Link copied to clipboard.',
    });

    analytics.track('DC Shared Contracts URL', {
      action: 'copied',
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

    analytics.track('DC Shared Contracts URL', {
      action: 'native-share',
      url,
    });
  }

  function onCheckboxChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelectedAddresses((addresses) => {
        return [...addresses, e.target.value];
      });
    } else {
      setSelectedAddresses((addresses) => {
        return addresses.filter((a) => a !== e.target.value);
      });
    }
  }

  function returnUrl() {
    const host = `${window.location.protocol}//${window.location.host}`;
    const url = `${host}/public/contracts?net=${environment.net}&addresses=${selectedAddresses.join(',')}`;
    return url;
  }

  return (
    <Flex stack gap="l">
      <Text>Sharing will allow users to view analytics and interact with the selected contracts.</Text>

      <Flex stack>
        <H5>1. Select {environment.name} Contracts</H5>

        <CheckboxGroup aria-label="Select contracts to share" css={{ width: '100%' }}>
          {contracts.map((c) => (
            <Checkbox
              key={c.address}
              value={c.address}
              name={`sharedContracts-${c.address}`}
              onChange={onCheckboxChange}
            >
              {c.address}
            </Checkbox>
          ))}
        </CheckboxGroup>
      </Flex>

      <Flex stack>
        <H5>2. Share the Link</H5>

        <Flex align="center">
          <Button
            disabled={selectedAddresses.length === 0}
            stableId={StableId.SHARE_CONTRACTS_COPY_LINK_BUTTON}
            color="neutral"
            css={{ flexGrow: 1 }}
            onClick={copyLink}
          >
            <FeatherIcon icon="link" color="primary" /> Copy Link
          </Button>

          {deviceSupportsSharing && (
            <>
              <Text color="text3" size="bodySmall">
                or
              </Text>

              <Button
                disabled={selectedAddresses.length === 0}
                stableId={StableId.SHARE_CONTRACTS_SEND_LINK_BUTTON}
                css={{ flexGrow: 1 }}
                onClick={shareLink}
              >
                <FeatherIcon icon="share-2" /> Share Link
              </Button>
            </>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}

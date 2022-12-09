import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';

import { Button } from '@/components/lib/Button';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Section } from '@/components/lib/Section';
import * as Tabs from '@/components/lib/Tabs';
import { TextLink } from '@/components/lib/TextLink';
import { TextOverflow } from '@/components/lib/TextOverflow';
import { Tooltip } from '@/components/lib/Tooltip';
import { useContracts } from '@/hooks/contracts';
import { usePublicOrPrivateContract, usePublicOrPrivateContracts } from '@/hooks/contracts';
import { useCurrentEnvironment } from '@/hooks/environments';
import { wrapDashboardLayoutWithOptions } from '@/hooks/layouts';
import { usePublicMode } from '@/hooks/public';
import { useRouteParam } from '@/hooks/route';
import { useSelectedProject } from '@/hooks/selected-project';
import { ContractAbi } from '@/modules/contracts/components/ContractAbi';
import { ContractDetails } from '@/modules/contracts/components/ContractDetails';
import { ContractInteract } from '@/modules/contracts/components/ContractInteract';
import { DeleteContractModal } from '@/modules/contracts/components/DeleteContractModal';
import { useAnyAbi } from '@/modules/contracts/hooks/abi';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const ViewContract: NextPageWithLayout = () => {
  const { publicModeIsActive } = usePublicMode();
  const router = useRouter();
  const contractSlug = useRouteParam('slug', '/contracts', true) || undefined;
  const { project } = useSelectedProject();
  const { environment } = useCurrentEnvironment();
  const { contracts: privateContracts } = useContracts(project?.slug, environment?.subId);
  const { contracts } = usePublicOrPrivateContracts(privateContracts);
  const { contract } = usePublicOrPrivateContract(contractSlug);
  const activeTab = useRouteParam('tab', `/contracts/${contractSlug}?tab=details`, true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const abis = useAnyAbi(contract);
  const abi = abis.embeddedQuery.data?.abiRoot || abis.privateQuery.data?.abi;

  // TODO: Pull in useSelectedProjectSync() to match [triggeredAlertId].tsx logic to sync env/proj to loaded contract.
  // TODO: Handle 404

  const onDelete = useCallback(() => router.replace('/contracts'), [router]);

  function onSelectedContractChange(slug: string) {
    router.push(`/contracts/${slug}?tab=${activeTab}`);
  }

  return (
    <>
      <Tabs.Root value={activeTab || ''}>
        <Section background="surface2">
          <Flex stack gap="l">
            <Link href="/contracts" passHref>
              <TextLink stableId={StableId.CONTRACT_BACK_TO_CONTRACTS_LINK}>
                <FeatherIcon icon="arrow-left" /> Contracts
              </TextLink>
            </Link>

            <Flex gap="l" stack={{ '@laptop': true }} align={{ '@initial': 'center', '@laptop': 'stretch' }}>
              <DropdownMenu.Root>
                <DropdownMenu.Button
                  stableId={StableId.CONTRACT_ADDRESS_DROPDOWN}
                  css={{
                    width: '100%',
                    flexShrink: 1,
                    maxWidth: '26rem',
                    '@laptop': {
                      maxWidth: '100%',
                    },
                  }}
                >
                  <FeatherIcon icon="zap" color="primary" />
                  <TextOverflow>{contract?.address || '...'}</TextOverflow>
                </DropdownMenu.Button>

                <DropdownMenu.Content align="start" width="trigger">
                  <DropdownMenu.RadioGroup value={contractSlug} onValueChange={onSelectedContractChange}>
                    {contracts?.map((c) => {
                      return (
                        <DropdownMenu.RadioItem key={c.slug} value={c.slug.toString()}>
                          {c.address}
                        </DropdownMenu.RadioItem>
                      );
                    })}
                  </DropdownMenu.RadioGroup>
                </DropdownMenu.Content>
              </DropdownMenu.Root>

              <Flex gap="l" css={{ width: 'auto', flexGrow: 1 }}>
                <Tabs.List inline css={{ marginRight: 'auto' }}>
                  <Tabs.Trigger
                    value="details"
                    href={`/contracts/${contractSlug}?tab=details`}
                    stableId={StableId.CONTRACT_TABS_DETAILS_LINK}
                  >
                    <FeatherIcon icon="list" size="xs" /> Details
                  </Tabs.Trigger>

                  <Tabs.Trigger
                    value="interact"
                    href={`/contracts/${contractSlug}?tab=interact`}
                    stableId={StableId.CONTRACT_TABS_INTERACT_LINK}
                  >
                    <FeatherIcon icon="terminal" size="xs" /> Interact
                  </Tabs.Trigger>

                  {abi && (
                    <Tabs.Trigger
                      value="abi"
                      href={`/contracts/${contractSlug}?tab=abi`}
                      stableId={StableId.CONTRACT_TABS_ABI_LINK}
                    >
                      <FeatherIcon icon="file-text" size="xs" /> ABI
                    </Tabs.Trigger>
                  )}
                </Tabs.List>

                {!publicModeIsActive && (
                  <Tooltip content="Remove this contract">
                    <Button
                      stableId={StableId.CONTRACT_OPEN_REMOVE_MODAL_BUTTON}
                      color="neutral"
                      aria-label="Remove Contract"
                      size="s"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <FeatherIcon icon="trash-2" size="xs" color="text2" />
                    </Button>
                  </Tooltip>
                )}
              </Flex>
            </Flex>
          </Flex>
        </Section>

        <Section>
          <Tabs.Content css={{ paddingTop: 0 }} value="details">
            <ContractDetails contract={contract} />
          </Tabs.Content>

          <Tabs.Content css={{ paddingTop: 0 }} value="interact">
            <ContractInteract contract={contract} />
          </Tabs.Content>

          {abi && (
            <Tabs.Content css={{ paddingTop: 0 }} value="abi">
              <ContractAbi contract={contract} />
            </Tabs.Content>
          )}
        </Section>
      </Tabs.Root>

      {contract && (
        <DeleteContractModal
          contract={contract}
          show={showDeleteModal}
          setShow={setShowDeleteModal}
          onDelete={onDelete}
        />
      )}
    </>
  );
};

ViewContract.getLayout = wrapDashboardLayoutWithOptions({
  redirect: {
    environmentChange: true,
    projectChange: true,
    url: '/contracts',
  },
});

export default ViewContract;

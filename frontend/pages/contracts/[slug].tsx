import type { Api } from '@pc/common/types/api';
import type { Projects } from '@pc/common/types/core';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';

import { Button } from '@/components/lib/Button';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import * as Tabs from '@/components/lib/Tabs';
import { TextLink } from '@/components/lib/TextLink';
import { TextOverflow } from '@/components/lib/TextOverflow';
import { Tooltip } from '@/components/lib/Tooltip';
import { withSelectedProject } from '@/components/with-selected-project';
import { wrapDashboardLayoutWithOptions } from '@/hooks/layouts';
import { useSureProjectContext } from '@/hooks/project-context';
import { useQuery } from '@/hooks/query';
import { useRouteParam } from '@/hooks/route';
import { ContractAbi } from '@/modules/contracts/components/ContractAbi';
import { ContractDetails } from '@/modules/contracts/components/ContractDetails';
import { ContractInteract } from '@/modules/contracts/components/ContractInteract';
import { DeleteContractModal } from '@/modules/contracts/components/DeleteContractModal';
import { useAnyAbi } from '@/modules/contracts/hooks/abi';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

type Contract = Api.Query.Output<'/projects/getContracts'>[number];

const ContractLink = ({ contract, activeTab }: { contract: Contract; activeTab: string | null }) => {
  const abis = useAnyAbi(contract);
  const abi = abis.embeddedQuery.data?.abi || abis.query.data?.abi;
  if (!abi) {
    return <Spinner />;
  }
  return (
    <Link href={`/contracts/${contract.slug}?tab=abi`} passHref>
      <Tabs.TriggerLink stableId={StableId.CONTRACT_TABS_ABI_LINK} active={activeTab === 'abi'}>
        <FeatherIcon icon="file-text" size="xs" /> Contract ABI
      </Tabs.TriggerLink>
    </Link>
  );
};

const ContractTab = ({ contract }: { contract: Contract }) => {
  const abis = useAnyAbi(contract);
  const abi = abis.embeddedQuery.data?.abi || abis.query.data?.abi;
  if (!abi) {
    return <Spinner />;
  }
  return (
    <Tabs.Content css={{ paddingTop: 0 }} value="abi">
      <ContractAbi contract={contract} />
    </Tabs.Content>
  );
};

const ViewContract: NextPageWithLayout = () => {
  const contractSlug = useRouteParam('slug', '/contracts', true) as Projects.ContractSlug;
  const { projectSlug, environmentSubId } = useSureProjectContext();
  const router = useRouter();
  const contractsQuery = useQuery(['/projects/getContracts', { project: projectSlug, environment: environmentSubId }]);
  const contractQuery = useQuery(['/projects/getContract', { slug: contractSlug }]);
  const activeTab = useRouteParam('tab', `/contracts/${contractSlug}?tab=details`, true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // TODO: Pull in useSelectedProjectSync() to match [triggeredAlertId].tsx logic to sync env/proj to loaded contract.
  // TODO: Handle 404

  const onDelete = useCallback(() => router.replace('/contracts'), [router]);

  function onSelectedContractChange(slug: string) {
    router.push(`/contracts/${slug}?tab=${activeTab}`);
  }

  return (
    <>
      <Tabs.Root value={activeTab || ''}>
        <Section>
          <Flex stack>
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
                  <TextOverflow>{contractQuery.data?.address || '...'}</TextOverflow>
                </DropdownMenu.Button>

                <DropdownMenu.Content align="start" width="trigger">
                  <DropdownMenu.RadioGroup value={contractSlug} onValueChange={onSelectedContractChange}>
                    {contractsQuery.data?.map((c) => {
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
                <Tabs.List tabIndex={-1} inline css={{ marginRight: 'auto' }}>
                  <Link href={`/contracts/${contractSlug}?tab=details`} passHref>
                    <Tabs.TriggerLink stableId={StableId.CONTRACT_TABS_DETAILS_LINK} active={activeTab === 'details'}>
                      <FeatherIcon icon="list" size="xs" /> Details
                    </Tabs.TriggerLink>
                  </Link>

                  <Link href={`/contracts/${contractSlug}?tab=interact`} passHref>
                    <Tabs.TriggerLink stableId={StableId.CONTRACT_TABS_INTERACT_LINK} active={activeTab === 'interact'}>
                      <FeatherIcon icon="terminal" size="xs" /> Interact
                    </Tabs.TriggerLink>
                  </Link>

                  {contractQuery.data ? <ContractLink contract={contractQuery.data} activeTab={activeTab} /> : null}
                </Tabs.List>

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
              </Flex>
            </Flex>
          </Flex>
        </Section>

        <Section>
          <Tabs.Content css={{ paddingTop: 0 }} value="details">
            {contractQuery.data ? <ContractDetails contract={contractQuery.data} /> : <Spinner />}
          </Tabs.Content>

          <Tabs.Content css={{ paddingTop: 0 }} value="interact">
            {contractQuery.data ? <ContractInteract contract={contractQuery.data} /> : <Spinner />}
          </Tabs.Content>

          {contractQuery.data ? <ContractTab contract={contractQuery.data} /> : null}
        </Section>
      </Tabs.Root>

      {contractQuery.data && (
        <DeleteContractModal
          contract={contractQuery.data}
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

export default withSelectedProject(ViewContract);

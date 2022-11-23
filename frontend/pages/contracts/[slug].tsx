import type { Api } from '@pc/common/types/api';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { mutate } from 'swr';

import { Button } from '@/components/lib/Button';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Section } from '@/components/lib/Section';
import * as Tabs from '@/components/lib/Tabs';
import { TextLink } from '@/components/lib/TextLink';
import { TextOverflow } from '@/components/lib/TextOverflow';
import { Tooltip } from '@/components/lib/Tooltip';
import { useAuth } from '@/hooks/auth';
import { wrapDashboardLayoutWithOptions } from '@/hooks/layouts';
import { useMaybeProjectContext } from '@/hooks/project-context';
import { usePublicMode } from '@/hooks/public';
import { useRouteParam } from '@/hooks/route';
import { ContractAbi } from '@/modules/contracts/components/ContractAbi';
import { ContractDetails } from '@/modules/contracts/components/ContractDetails';
import { ContractInteract } from '@/modules/contracts/components/ContractInteract';
import { ContractsWrapper } from '@/modules/contracts/components/ContractsWrapper';
import { ContractWrapper } from '@/modules/contracts/components/ContractWrapper';
import { DeleteContractModal } from '@/modules/contracts/components/DeleteContractModal';
import { useAnyAbi } from '@/modules/contracts/hooks/abi';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

type Contract = Api.Query.Output<'/projects/getContract'>;

const ContractAbiLink = ({
  contract,
  contractSlug,
  activeTab,
}: {
  contract: Contract | undefined;
  contractSlug: string;
  activeTab: string | null;
}) => {
  const { contractAbi } = useAnyAbi(contract);
  if (!contractAbi) {
    return null;
  }
  return (
    <Link href={`/contracts/${contractSlug}?tab=abi`} passHref>
      <Tabs.TriggerLink stableId={StableId.CONTRACT_TABS_ABI_LINK} active={activeTab === 'abi'}>
        <FeatherIcon icon="file-text" size="xs" /> Contract ABI
      </Tabs.TriggerLink>
    </Link>
  );
};

const ContractAbiTab = ({ contract }: { contract: Contract | undefined }) => {
  const { contractAbi } = useAnyAbi(contract);
  if (!contractAbi) {
    return null;
  }
  return (
    <Tabs.Content css={{ paddingTop: 0 }} value="abi">
      <ContractAbi contract={contract} />
    </Tabs.Content>
  );
};

const ViewContract: NextPageWithLayout = () => {
  const { publicModeIsActive } = usePublicMode();
  const router = useRouter();
  const contractSlug = useRouteParam('slug', '/contracts', true) || '';
  const activeTab = useRouteParam('tab', `/contracts/${contractSlug}?tab=details`, true);
  const { identity } = useAuth();
  const { projectSlug, environmentSubId } = useMaybeProjectContext();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // TODO: Pull in useSelectedProjectSync() to match [triggeredAlertId].tsx logic to sync env/proj to loaded contract.
  // TODO: Handle 404

  function onDelete(contract: Contract) {
    mutate(['/projects/getContracts', projectSlug, environmentSubId, identity?.uid], (contracts) => {
      return contracts?.filter((c) => c.slug !== contract.slug) || [];
    });
    router.replace('/contracts');
  }

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
                  <ContractWrapper slug={contractSlug}>
                    {({ contract }) => <TextOverflow>{contract?.address || '...'}</TextOverflow>}
                  </ContractWrapper>
                </DropdownMenu.Button>

                <DropdownMenu.Content align="start" width="trigger">
                  <DropdownMenu.RadioGroup value={contractSlug} onValueChange={onSelectedContractChange}>
                    <ContractsWrapper>
                      {({ contracts }) => (
                        <>
                          {contracts?.map((c) => {
                            return (
                              <DropdownMenu.RadioItem key={c.slug} value={c.slug.toString()}>
                                {c.address}
                              </DropdownMenu.RadioItem>
                            );
                          })}
                        </>
                      )}
                    </ContractsWrapper>
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

                  <ContractWrapper slug={contractSlug}>
                    {({ contract }) => (
                      <ContractAbiLink contractSlug={contractSlug} activeTab={activeTab} contract={contract} />
                    )}
                  </ContractWrapper>
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

        <ContractWrapper slug={contractSlug}>
          {({ contract }) => (
            <Section>
              <Tabs.Content css={{ paddingTop: 0 }} value="details">
                <ContractDetails contract={contract} />
              </Tabs.Content>

              <Tabs.Content css={{ paddingTop: 0 }} value="interact">
                <ContractInteract contract={contract} />
              </Tabs.Content>

              <ContractWrapper slug={contractSlug}>
                {({ contract }) => <ContractAbiTab contract={contract} />}
              </ContractWrapper>
            </Section>
          )}
        </ContractWrapper>
      </Tabs.Root>

      <ContractWrapper slug={contractSlug}>
        {({ contract }) => {
          if (!contract) {
            return null;
          }
          return (
            <DeleteContractModal
              contract={contract}
              show={showDeleteModal}
              setShow={setShowDeleteModal}
              onDelete={onDelete}
            />
          );
        }}
      </ContractWrapper>
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

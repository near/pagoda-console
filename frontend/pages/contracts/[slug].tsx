import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { Button } from '@/components/lib/Button';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Section } from '@/components/lib/Section';
import * as Tabs from '@/components/lib/Tabs';
import { Text } from '@/components/lib/Text';
import { TextOverflow } from '@/components/lib/TextOverflow';
import { Tooltip } from '@/components/lib/Tooltip';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useContract, useContracts } from '@/hooks/contracts';
import { wrapDashboardLayoutWithOptions } from '@/hooks/layouts';
import { useRouteParam } from '@/hooks/route';
import { useSelectedProject } from '@/hooks/selected-project';
import { ContractAbi } from '@/modules/contracts/components/ContractAbi';
import { ContractDetails } from '@/modules/contracts/components/ContractDetails';
import { ContractInteract } from '@/modules/contracts/components/ContractInteract';
import { DeleteContractModal } from '@/modules/contracts/components/DeleteContractModal';
import { useContractAbi } from '@/modules/contracts/hooks/abi';
import { useWalletSelector } from '@/modules/contracts/hooks/wallet-selector';
import type { NextPageWithLayout } from '@/utils/types';
import type { Contract } from '@/utils/types';

const ViewContract: NextPageWithLayout = () => {
  const router = useRouter();
  const contractSlug = useRouteParam('slug', '/contracts', true) || undefined;
  const { environment, project } = useSelectedProject();
  const { contracts, mutate: mutateContracts } = useContracts(project?.slug, environment?.subId);
  const { contract } = useContract(contractSlug);
  const activeTab = useRouteParam('tab', `/contracts/${contractSlug}?tab=details`, true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContractSlug, setSelectedContractSlug] = useState<string | null>(null);
  const [walletNotice, setWalletNotice] = useState(false);
  const { selector } = useWalletSelector(contract?.address);
  const { contractAbi } = useContractAbi(contract?.slug);

  // TODO: Pull in useSelectedProjectSync() to match [triggeredAlertId].tsx logic to sync env/proj to loaded contract.
  // TODO: Handle 404

  function onDelete(contract: Contract) {
    mutateContracts((contracts) => {
      return contracts?.filter((c) => c.slug !== contract.slug) || [];
    });
    router.replace('/contracts');
  }

  function onSelectedContractChange(slug: string) {
    if (selector && selector.isSignedIn()) {
      setSelectedContractSlug(slug);
      setWalletNotice(true);
    } else {
      //* This is a hack, this is forcing a reload to be able to refresh the modal component
      //* for wallet selector to allow switching contract.
      //* See: https://github.com/near/wallet-selector/issues/403
      // router.push(`/contracts/${slug}?tab=${activeTab}`);
      window.location.href = `/contracts/${slug}?tab=${activeTab}`;
    }
  }

  async function onWalletLogoutConfirm() {
    setWalletNotice(false);
    const wallet = await selector!.wallet();
    await wallet.signOut();
    router.push(`/contracts/${selectedContractSlug}?tab=${activeTab}`);
  }

  return (
    <>
      <Tabs.Root value={activeTab || ''}>
        <Section>
          <Flex gap="l" stack={{ '@laptop': true }} align={{ '@initial': 'center', '@laptop': 'stretch' }}>
            <DropdownMenu.Root>
              <DropdownMenu.Button
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
              <Tabs.List tabIndex={-1} inline css={{ marginRight: 'auto' }}>
                <Link href={`/contracts/${contractSlug}?tab=details`} passHref>
                  <Tabs.TriggerLink active={activeTab === 'details'}>
                    <FeatherIcon icon="list" size="xs" /> Details
                  </Tabs.TriggerLink>
                </Link>

                <Link href={`/contracts/${contractSlug}?tab=interact`} passHref>
                  <Tabs.TriggerLink active={activeTab === 'interact'}>
                    <FeatherIcon icon="terminal" size="xs" /> Interact
                  </Tabs.TriggerLink>
                </Link>

                {contractAbi && (
                  <Link href={`/contracts/${contractSlug}?tab=abi`} passHref>
                    <Tabs.TriggerLink active={activeTab === 'abi'}>
                      <FeatherIcon icon="file-text" size="xs" /> Contract ABI
                    </Tabs.TriggerLink>
                  </Link>
                )}
              </Tabs.List>

              <Tooltip content="Remove this contract">
                <Button color="neutral" aria-label="Remove Contract" size="s" onClick={() => setShowDeleteModal(true)}>
                  <FeatherIcon icon="trash-2" size="xs" color="text2" />
                </Button>
              </Tooltip>
            </Flex>
          </Flex>
        </Section>

        <Section>
          <Tabs.Content css={{ paddingTop: 0 }} value="details">
            <ContractDetails contract={contract} environment={environment} />
          </Tabs.Content>

          <Tabs.Content css={{ paddingTop: 0 }} value="interact">
            <ContractInteract contract={contract} />
          </Tabs.Content>

          {contractAbi && (
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

      {selector && selector.isSignedIn() && (
        <ConfirmModal
          onConfirm={onWalletLogoutConfirm}
          setShow={setWalletNotice}
          show={walletNotice}
          title="Connect Wallet Notice"
        >
          <Text>Changing contracts will log out you away from your wallet account. Would you like to change?</Text>
        </ConfirmModal>
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

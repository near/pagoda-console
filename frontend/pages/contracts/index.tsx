import type { Api } from '@pc/common/types/api';
import { useRouter } from 'next/router';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { useState } from 'react';

import { Button } from '@/components/lib/Button';
import * as Dialog from '@/components/lib/Dialog';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1, H5 } from '@/components/lib/Heading';
import { List, ListItem } from '@/components/lib/List';
import { Placeholder } from '@/components/lib/Placeholder';
import { Section } from '@/components/lib/Section';
import * as Table from '@/components/lib/Table';
import { Text } from '@/components/lib/Text';
import { TextButton } from '@/components/lib/TextLink';
import { useContractMetrics, useContracts } from '@/hooks/contracts';
import { usePublicOrPrivateContracts } from '@/hooks/contracts';
import { useCurrentEnvironment } from '@/hooks/environments';
import { useDashboardLayout } from '@/hooks/layouts';
import { usePublicMode } from '@/hooks/public';
import { useSelectedProject } from '@/hooks/selected-project';
import { AddContractForm } from '@/modules/contracts/components/AddContractForm';
import { DeleteContractModal } from '@/modules/contracts/components/DeleteContractModal';
import { ShareContracts } from '@/modules/contracts/components/ShareContracts';
import { useAnyAbi } from '@/modules/contracts/hooks/abi';
import { convertYoctoToNear } from '@/utils/convert-near';
import { formatBytes } from '@/utils/format-bytes';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

type Contract = Api.Query.Output<'/projects/getContracts'>[number];

const ListContracts: NextPageWithLayout = () => {
  const { publicModeIsActive } = usePublicMode();
  const { project } = useSelectedProject();
  const { environment } = useCurrentEnvironment();
  const { contracts: privateContracts, mutate } = useContracts(project?.slug, environment?.subId);
  const { contracts } = usePublicOrPrivateContracts(privateContracts);
  const [addContractIsOpen, setAddContractIsOpen] = useState(false);
  const [shareContractsIsOpen, setShareContractsIsOpen] = useState(false);

  function onContractAdd(contract: Contract) {
    mutate((contracts) => contracts && [...contracts, contract]);
    setAddContractIsOpen(false);
  }

  return (
    <>
      <Section>
        <Flex stack gap="l">
          <Flex align="center">
            <Flex align="center" autoWidth css={{ marginRight: 'auto' }}>
              <FeatherIcon icon="zap" size="m" />
              <H1>Contracts</H1>
            </Flex>

            <Flex autoWidth>
              {contracts && contracts.length > 0 && (
                <Button
                  color="neutral"
                  stableId={StableId.CONTRACTS_OPEN_SHARE_CONTRACTS_MODAL_BUTTON}
                  onClick={() => setShareContractsIsOpen(true)}
                  hideText="tablet"
                >
                  <FeatherIcon icon="share" /> Share
                </Button>
              )}

              {!publicModeIsActive && (
                <Button
                  stableId={StableId.CONTRACTS_OPEN_ADD_CONTRACT_MODAL_BUTTON}
                  onClick={() => setAddContractIsOpen(true)}
                  hideText="tablet"
                >
                  <FeatherIcon icon="plus" /> Add Contract
                </Button>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Section>

      <ContractsTable contracts={contracts} setAddContractIsOpen={setAddContractIsOpen} />

      {!publicModeIsActive && project && environment && (
        <Dialog.Root open={addContractIsOpen} onOpenChange={setAddContractIsOpen}>
          <Dialog.Content title="Add Contract" size="s">
            <AddContractForm project={project} environment={environment} onAdd={onContractAdd} />
          </Dialog.Content>
        </Dialog.Root>
      )}

      {contracts && environment && (
        <Dialog.Root open={shareContractsIsOpen} onOpenChange={setShareContractsIsOpen}>
          <Dialog.Content title="Share Contracts" size="s">
            <ShareContracts contracts={contracts} environment={environment} />
          </Dialog.Content>
        </Dialog.Root>
      )}
    </>
  );
};

function ContractsTable({
  contracts,
  setAddContractIsOpen,
}: {
  contracts?: Contract[];
  setAddContractIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  if (contracts?.length === 0) {
    return (
      <Section css={{ margin: 'auto' }}>
        <Flex stack gap="l" css={{ margin: 'auto', maxWidth: 'var(--size-max-container-width-m)' }}>
          <Flex stack gap="s">
            <H5>{`Your selected environment doesn't have any contracts yet.`}</H5>
            <Text>{`Adding a contract allows you to:`}</Text>
          </Flex>
          <List as="ol">
            <ListItem>View metrics and transactions.</ListItem>
            <ListItem>Upload a Contract ABI.</ListItem>
            <ListItem>Interact with the contract via the ABI.</ListItem>
          </List>
          <TextButton
            stableId={StableId.CONTRACTS_OPEN_ADD_CONTRACT_MODAL_TEXT_BUTTON}
            onClick={() => setAddContractIsOpen(true)}
          >
            Add a Contract
          </TextButton>
        </Flex>
      </Section>
    );
  }

  return (
    <Section>
      <Flex stack gap="l">
        <Table.Root>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Address</Table.HeaderCell>
              <Table.HeaderCell>Balance</Table.HeaderCell>
              <Table.HeaderCell>Storage</Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
            </Table.Row>
          </Table.Head>

          <Table.Body>
            {!contracts && <Table.PlaceholderRows />}

            {contracts?.map((contract) => {
              return <ContractTableRow contract={contract} key={contract.slug} />;
            })}
          </Table.Body>
        </Table.Root>
      </Flex>
    </Section>
  );
}

function ContractTableRow({ contract }: { contract: Contract }) {
  const { metrics, error } = useContractMetrics(contract.address, contract.net);
  const url = `/contracts/${contract.slug}`;
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const abis = useAnyAbi(contract);
  const hasAbi = Boolean(abis.embeddedQuery.data?.abiRoot || abis.privateQuery.data?.abi);
  const { publicModeIsActive } = usePublicMode();

  function ContractTableCellData({ children }: { children: ReactNode }) {
    if (metrics)
      return (
        <Text family="number" color="text2" size="current">
          {children}
        </Text>
      );

    if (error)
      return (
        <Text family="number" color="text3" size="current">
          N/A
        </Text>
      );

    return <Placeholder css={{ width: '7rem', height: '1rem' }} />;
  }

  return (
    <>
      <Table.Row>
        <Table.Cell href={url} wrap css={{ width: '50%', minWidth: '12rem' }}>
          {contract.address}
        </Table.Cell>

        <Table.Cell href={url}>
          <ContractTableCellData>{metrics && convertYoctoToNear(metrics.amount, true)}</ContractTableCellData>
        </Table.Cell>

        <Table.Cell href={url}>
          <ContractTableCellData>{metrics && formatBytes(metrics.storage_usage)}</ContractTableCellData>
        </Table.Cell>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Table.Cell clickable css={{ width: '1px' }}>
              <FeatherIcon icon="more-vertical" size="xs" />
            </Table.Cell>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content align="end" sideOffset={-5} alignOffset={-5}>
            <DropdownMenu.Item onClick={() => router.push(`/contracts/${contract.slug}?tab=details`)}>
              <Flex align="center">
                <FeatherIcon icon="list" color="primary" /> Details
              </Flex>
            </DropdownMenu.Item>

            <DropdownMenu.Item onClick={() => router.push(`/contracts/${contract.slug}?tab=interact`)}>
              <Flex align="center">
                <FeatherIcon icon="terminal" color="primary" /> Interact
              </Flex>
            </DropdownMenu.Item>

            {hasAbi && (
              <DropdownMenu.Item onClick={() => router.push(`/contracts/${contract.slug}?tab=abi`)}>
                <Flex align="center">
                  <FeatherIcon icon="file-text" color="primary" /> Contract ABI
                </Flex>
              </DropdownMenu.Item>
            )}

            {!publicModeIsActive && (
              <DropdownMenu.Item onClick={() => setShowDeleteModal(true)}>
                <Flex align="center">
                  <FeatherIcon icon="trash-2" color="danger" /> Remove
                </Flex>
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Table.Row>

      <DeleteContractModal contract={contract} show={showDeleteModal} setShow={setShowDeleteModal} />
    </>
  );
}

ListContracts.getLayout = useDashboardLayout;

export default ListContracts;

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import * as Accordion from '@/components/lib/Accordion';
import * as Form from '@/components/lib/Form';
import { Tooltip } from '@/components/lib/Tooltip';
import { useSelectedProject } from '@/hooks/selected-project';
import { useSettingsStoreForUser } from '@/stores/settings';
import analytics from '@/utils/analytics';
import type { ContractMetadata, NftData, Token } from '@/utils/chain-data';
import { useContractInfo, useMetadata } from '@/utils/chain-data';
import { returnContractAddressRegex } from '@/utils/helpers';

import CodeBlock from '../CodeBlock';
import { Box } from '../lib/Box';
import { Button } from '../lib/Button';
import { FeatherIcon } from '../lib/FeatherIcon';
import { Flex } from '../lib/Flex';
import { H3, H4 } from '../lib/Heading';
import { Text } from '../lib/Text';
import { TextLink } from '../lib/TextLink';
import { TextOverflow } from '../lib/TextOverflow';
import * as S from './styles';

interface NftInfoFormData {
  contractAddress: string;
}

export function NftInfoCard() {
  const { register, handleSubmit, formState, setValue } = useForm<NftInfoFormData>();
  const [isEditing, setIsEditing] = useState(true);
  const [savedContractAddress, setSavedContractAddress] = useState<string | null>(null);
  const [showQuickInfo, setShowQuickInfo] = useState(true);
  const { environment } = useSelectedProject();
  const { projectSettings, updateProjectSettings } = useSettingsStoreForUser();
  const contractAddressRegex = returnContractAddressRegex(environment);

  useEffect(() => {
    const { nftContract } = projectSettings;

    if (nftContract) {
      setSavedContractAddress(nftContract || null);
      setValue('contractAddress', nftContract);
      setIsEditing(false);
    }
  }, [projectSettings, setValue]);

  // fetch basic account info for the NFT contract
  const { data: contractBasics, error: basicsError } = useContractInfo(savedContractAddress);

  // fetch full NFT contract data based on functions required by nft-1.0.0
  const { data: nftData, error: nftError } = useMetadata(
    'NFT',
    savedContractAddress && contractBasics?.accountExists && contractBasics?.codeDeployed ? savedContractAddress : null,
  );

  // update the contract address for data fetching
  const saveAddressChange: SubmitHandler<NftInfoFormData> = async ({ contractAddress }) => {
    setSavedContractAddress(contractAddress);
    setIsEditing(false);
    updateProjectSettings({
      nftContract: contractAddress,
    });
    analytics.track('DC Set NFT quick info card address');
  };

  function toggleQuickInfo() {
    setShowQuickInfo(!showQuickInfo);
  }

  let metadataError;
  if (nftData?.errors.metadata === 'METHOD_NOT_IMPLEMENTED') {
    metadataError = 'Function nft_metadata() not implemented';
  } else if (nftData?.initialized && nftData?.errors.metadata) {
    metadataError = "Couldn't fetch metadata from nft_metadata()";
  }

  return (
    <S.Root open={showQuickInfo}>
      <S.Header onClick={toggleQuickInfo}>
        <H3 css={{ marginRight: 'auto' }}>Live Contract Data</H3>
        {(basicsError || nftError) && <ErrorIndicator />}
        <FeatherIcon icon="chevron-down" size="l" data-arrow-icon />
      </S.Header>

      <Flex stack>
        {!savedContractAddress && (
          <Text>
            I’ll show you contract metrics here. Paste in your NFT contract address below and info will update here as
            you progress through the tutorial.
          </Text>
        )}

        {isEditing || !savedContractAddress ? (
          <Form.Root disabled={formState.isSubmitting} onSubmit={handleSubmit(saveAddressChange)}>
            <Flex>
              <Form.Group>
                <Form.Input
                  isInvalid={!!formState.errors.contractAddress}
                  placeholder="contract.testnet"
                  {...register('contractAddress', {
                    required: 'Address field is required',
                    pattern: {
                      value: contractAddressRegex,
                      message: 'Invalid address format',
                    },
                  })}
                />
                <Form.Feedback>{formState.errors.contractAddress?.message}</Form.Feedback>
              </Form.Group>
              <Button type="submit">Save</Button>
            </Flex>
          </Form.Root>
        ) : (
          <Flex justify="spaceBetween" align="center">
            <Text as="span" color="text1" weight="semibold">
              {savedContractAddress}
            </Text>
            <Button
              color="neutral"
              size="s"
              onClick={() => {
                setIsEditing(true);
              }}
            >
              Edit
            </Button>
          </Flex>
        )}

        {savedContractAddress && contractBasics && (
          <>
            {contractBasics && (
              <StatusRow
                accountExists={!!contractBasics?.accountExists}
                codeDeployed={!!contractBasics?.codeDeployed}
                contractInitialized={!!nftData?.initialized}
              />
            )}

            {metadataError && <Text color="danger">{metadataError}</Text>}

            {nftData && nftData.claimsSpec && nftData.initialized && <NftInfo nftData={nftData} />}
          </>
        )}
      </Flex>
    </S.Root>
  );
}

// wrapper component for the metadata and token list sections
function NftInfo({ nftData }: { nftData: NftData }) {
  let tokenError;
  if (nftData?.errors.tokenJson === 'METHOD_NOT_IMPLEMENTED') {
    tokenError = 'Function nft_tokens() not implemented';
  } else if (nftData?.errors.tokenJson) {
    tokenError = "Couldn't fetch list of tokens from nft_tokens()";
  }

  return (
    <Flex stack>
      {nftData?.metadata && (
        <NftOverview
          metadata={nftData.metadata}
          supply={nftData.supply}
          supplyError={!!nftData.errors.supply}
          supplyNotImplemented={nftData.errors.supply === 'METHOD_NOT_IMPLEMENTED'}
        />
      )}

      {nftData?.errors.metadata && <Text color="danger">Couldn&#39;t fetch contract metadata from nft_metadata()</Text>}

      <H4>Tokens</H4>

      {tokenError && <Text color="danger">{tokenError}</Text>}

      {nftData?.tokenJson && (
        <TokenList
          tokenJson={nftData.tokenJson}
          listCapped={typeof nftData?.supply === 'number' && nftData?.supply > 30}
        />
      )}

      {nftData?.supply === 0 && <Text>Mint an NFT to see it here!</Text>}
    </Flex>
  );
}

// displays metadata and total supply
// TODO clean up supplyNotImplemented. It's not efficient and was added in last minute
function NftOverview({
  metadata,
  supply,
  supplyError,
  supplyNotImplemented = false,
}: {
  metadata: ContractMetadata;
  supply?: number;
  supplyError: boolean;
  supplyNotImplemented?: boolean;
}) {
  const supplyErrorMessage = supplyNotImplemented
    ? 'Function nft_total_supply() not implemented'
    : supplyError
    ? "Couldn't fetch count of minted tokens from nft_total_supply()"
    : null;

  return (
    <S.Grid>
      <S.GridKey>Name</S.GridKey>
      <S.GridValue> {metadata.name}</S.GridValue>
      <S.GridKey>Spec</S.GridKey>
      <S.GridValue> {metadata.spec ?? 'unknown'}</S.GridValue>
      <S.GridKey>Symbol</S.GridKey>
      <S.GridValue>{metadata.symbol}</S.GridValue>
      <S.GridKey>Minted</S.GridKey>
      <S.GridValue>{supplyErrorMessage ? <Text color="danger">{supplyErrorMessage}</Text> : supply}</S.GridValue>
    </S.Grid>
  );
}

// list of minted tokens
function TokenList({ tokenJson, listCapped = false }: { tokenJson: Token[]; listCapped?: boolean }) {
  return (
    <Flex stack>
      <Accordion.Root type="multiple">
        {tokenJson.map((token: Token) => {
          // ? should we display some sort of error to help new users debug accidentally
          // ? minting without an id
          if (!token.token_id) {
            return;
          }
          return (
            <Accordion.Item value={token.token_id} key={token.token_id}>
              <Accordion.Trigger>
                <TextOverflow>{token?.metadata?.title || `ID: ${token.token_id}`}</TextOverflow>
              </Accordion.Trigger>

              <Accordion.Content>
                <Flex stack>
                  <NftPreview
                    title={token.metadata?.title}
                    url={token.metadata?.media}
                    id={token.token_id}
                    owner={token.owner_id}
                  />
                  <CodeBlock language="json">{JSON.stringify(token, null, 4)}</CodeBlock>
                </Flex>
              </Accordion.Content>
            </Accordion.Item>
          );
        })}
      </Accordion.Root>

      {listCapped && (
        <Text>
          There’s more where that came from! We can only show 30 tokens here at a time, but you can query the rest as
          shown in the{' '}
          <Link href="/tutorials/nfts/enumeration#nft-tokens" passHref>
            <TextLink>{'Enumerating tokens > NFT tokens'}</TextLink>
          </Link>{' '}
          section.
        </Text>
      )}
    </Flex>
  );
}

// displays basic information for a single NFT
function NftPreview({
  url,
  title,
  id,
  owner,
}: {
  url?: string | null;
  title?: string | null;
  id?: string | null;
  owner?: string | null;
}) {
  return (
    <Flex
      css={{
        minHeight: '4.5rem',
      }}
    >
      <Box
        css={{
          minWidth: '4.5rem',
          maxWidth: '4.5rem',
          height: '4.5rem',
          border: '1px solid',
          borderRadius: 'var(--border-radius-s)',
          img: {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          },
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {url ? <img src={url} alt="Preview of NFT media" /> : '??'}
      </Box>

      <S.Grid>
        <S.GridKey>Title</S.GridKey>
        <S.GridValue>{title}</S.GridValue>
        <S.GridKey>ID</S.GridKey>
        <S.GridValue>{id || 'unknown'}</S.GridValue>
        <S.GridKey>Owner</S.GridKey>
        <S.GridValue>{owner || 'unknown'}</S.GridValue>
      </S.Grid>
    </Flex>
  );
}

// set of status checks on the contract
function StatusRow({
  accountExists,
  codeDeployed,
  contractInitialized,
}: {
  accountExists: boolean;
  codeDeployed: boolean;
  contractInitialized: boolean;
}) {
  return (
    <Flex>
      <StatusItem title="Account" value={accountExists} />
      <StatusItem title="Contract" value={codeDeployed} />
      <StatusItem title="Initialized" value={contractInitialized} />
    </Flex>
  );
}

// displays a check mark and label for a specific status check
function StatusItem({ title, value }: { title: string; value: boolean }) {
  return (
    <Flex autoWidth gap="s">
      <FeatherIcon icon={value ? 'check-circle' : 'circle'} color={value ? 'success' : 'text3'} />
      {title}
    </Flex>
  );
}

// indicator that there has been an error fetching data from RPC
function ErrorIndicator() {
  return (
    <Tooltip
      color="reverse"
      side="top"
      content="An error occurred while fetching data. Information shown may be outdated."
    >
      <Flex align="center" autoWidth>
        <FeatherIcon icon="alert-circle" size="m" color="danger" />
      </Flex>
    </Tooltip>
  );
}

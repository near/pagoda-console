import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { faCheckCircle, faChevronUp, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Accordion, Button, Form, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';

import analytics from '@/utils/analytics';
import { getUserData, updateUserData } from '@/utils/cache';
import type { ContractMetadata, NftData, Token } from '@/utils/chainData';
import { useContractInfo, useMetadata } from '@/utils/chainData';
import { useIdentity, useRouteParam } from '@/utils/hooks';

import CodeBlock from './CodeBlock';
import PageLink from './PageLink';

export default function NftInfoCard() {
  const [isEditing, setIsEditing] = useState(true);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [addressInputValue, setAddressInputValue] = useState('');
  const [showQuickInfo, setShowQuickInfo] = useState(true);

  const identity = useIdentity();

  // fetch NFT contract address from local storage at startup
  const project = useRouteParam('project');
  useEffect(() => {
    if (!project || !identity?.uid) {
      return;
    }

    let userData;
    try {
      userData = getUserData(identity.uid);
      const cachedContractAddress = userData?.projectData?.[project]?.nftContract;
      if (cachedContractAddress) {
        setContractAddress(cachedContractAddress);
        setIsEditing(false);
        setAddressInputValue(cachedContractAddress);
      }
    } catch (e) {
      // silently fail
      console.error(e);
    }
  }, [identity, project]);

  // fetch basic account info for the NFT contract
  const { data: contractBasics, error: basicsError } = useContractInfo(contractAddress);

  // fetch full NFT contract data based on functions required by nft-1.0.0
  const { data: nftData, error: nftError } = useMetadata(
    'NFT',
    contractAddress && contractBasics?.accountExists && contractBasics?.codeDeployed ? contractAddress : null,
  );

  // track the value of the input field without updated the value which is actually fetched
  async function handleAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAddressInputValue(e.target.value);
  }

  // update the contract address for data fetching
  function saveAddressChange(e: FormEvent) {
    e.preventDefault();
    setContractAddress(addressInputValue);
    setIsEditing(false);

    if (project && identity?.uid) {
      updateUserData(identity.uid, { projectData: { [project]: { nftContract: addressInputValue } } });
    }
    analytics.track('DC Set NFT quick info card address');
  }

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
    <div className={`nftContractCard${showQuickInfo ? ' openNftCard' : ''}`}>
      <div className="titleRow">
        <h2 className="quickInfoHeader">Live Contract Data</h2>
        {(basicsError || nftError) && <ErrorIndicator />}
        <div
          onClick={toggleQuickInfo}
          className={showQuickInfo ? 'animateOpen' : 'animateClosed'}
          style={{ cursor: 'pointer' }}
        >
          <FontAwesomeIcon icon={faChevronUp} size="2x" />
        </div>
      </div>
      {!contractAddress && (
        <span className="quickInfoInstructions">
          I’ll show you contract metrics here. Paste in your NFT contract address below and info will update here as you
          progress through the tutorial.
        </span>
      )}

      {/* contract address input */}
      {isEditing || !contractAddress ? (
        <Form className="contractForm" onSubmit={saveAddressChange}>
          <InputGroup>
            <Form.Control placeholder="contract.testnet" value={addressInputValue} onChange={handleAddressChange} />
            <Button type="submit">Save</Button>
          </InputGroup>
        </Form>
      ) : (
        <div className="address">
          <b className="addressText">{contractAddress}</b>
          <Button
            variant="outline-primary"
            onClick={() => {
              setIsEditing(true);
            }}
          >
            Edit
          </Button>
        </div>
      )}
      {contractAddress && contractBasics && (
        <div className="infoCardContent">
          {/* status */}
          {contractBasics && (
            <StatusRow
              accountExists={!!contractBasics?.accountExists}
              codeDeployed={!!contractBasics?.codeDeployed}
              contractInitialized={!!nftData?.initialized}
            />
          )}

          {metadataError && <div className="errorText">{metadataError}</div>}
          {nftData && nftData.claimsSpec && nftData.initialized && <NftInfo nftData={nftData} />}
        </div>
      )}
      <style jsx>{`
        .nftContractCard {
          position: fixed;
          z-index: 2;
          right: 2rem;
          width: 30rem;
          border-radius: 0.5rem;
          background-color: #f2f2f2;
          display: flex;
          flex-direction: column;
          padding: 1rem;
          row-gap: 1rem;
          box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
          overflow-y: auto;
          max-height: 40rem;
          top: 100vh;
          transition: all 250ms ease-in-out;
          transform: translateY(-4.5rem);
          overflow-y: hidden;
        }

        .openNftCard {
          transform: translateY(calc(-100% - 2rem));
          overflow-y: auto;
        }

        .infoCardContent {
          display: flex;
          flex-direction: column;
          row-gap: 1rem;
        }

        .collapsedToggle {
          transform: rotate(180deg);
        }

        .errorText {
          color: #a37800;
        }

        .animateOpen {
          animation: spin-open 250ms both;
        }
        @keyframes spin-open {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(180deg);
          }
        }
        .animateClosed {
          animation: spin-closed 250ms both;
        }
        @keyframes spin-closed {
          0% {
            transform: rotate(180deg);
          }

          100% {
            transform: rotate(0deg);
          }
        }

        .titleRow {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }
        .nftContractCard :global(.contractForm) {
          display: flex;
          flex-direction: row;
          column-gap: 0.5rem;
        }
        .address {
          display: flex;
          flex-direction: row;
          column-gap: 0.5rem;
          justify-content: space-between;
          align-items: center;
        }
        .address :global(.btn) {
          border-width: 0;
        }
        .addressText {
          overflow-wrap: anywhere;
        }
      `}</style>
    </div>
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
    <>
      {/* metadata */}
      <div className="metaFlex">
        {nftData?.metadata && (
          <NftOverview
            metadata={nftData.metadata}
            supply={nftData.supply}
            supplyError={!!nftData.errors.supply}
            supplyNotImplemented={nftData.errors.supply === 'METHOD_NOT_IMPLEMENTED'}
          />
        )}
        {nftData?.errors.metadata && (
          <div className="errorText">Couldn&#39;t fetch contract metadata from nft_metadata()</div>
        )}
      </div>

      {/* token list */}
      <div className="tokensTitle">Tokens</div>
      {tokenError && <div className="errorText">{tokenError}</div>}
      {nftData?.tokenJson && (
        <TokenList
          tokenJson={nftData.tokenJson}
          listCapped={typeof nftData?.supply === 'number' && nftData?.supply > 30}
        />
      )}
      {nftData?.supply === 0 && <div>Mint an NFT to see it here!</div>}
      <style jsx>{`
        .metaFlex {
          flex: 0;
        }
        .tokensTitle {
          font-size: 1.75rem;
          font-weight: 700;
        }
        .errorText {
          color: #a37800;
        }
      `}</style>
    </>
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
    <div className="infoGrid">
      <span className="label">Name</span>
      <span className="name"> {metadata.name}</span>
      <span className="label">Spec</span>
      <span className="spec"> {metadata.spec ?? 'unknown'}</span>
      <span className="label">Symbol</span>
      <span className="symbol">{metadata.symbol}</span>
      <span className="label">Minted</span>
      <span className="supply">
        {supplyErrorMessage ? <span className="errorText">{supplyErrorMessage}</span> : supply}
      </span>
      <style jsx>{`
        .infoGrid {
          display: grid;
          row-gap: 0.5rem;
          grid-template-columns: auto 1fr;
          column-gap: 1.5rem;
        }
        .label {
          font-weight: 600;
        }
        .errorText {
          color: #a37800;
        }
      `}</style>
    </div>
  );
}

// list of minted tokens
function TokenList({ tokenJson, listCapped = false }: { tokenJson: Token[]; listCapped?: boolean }) {
  return (
    <div className="tokenList">
      <Accordion>
        {tokenJson.map((token: Token) => {
          // ? should we display some sort of error to help new users debug accidentally
          // ? minting without an id
          if (!token.token_id) {
            return;
          }
          return (
            <Accordion.Item eventKey={token.token_id} key={token.token_id}>
              <Accordion.Header>
                <span className="title">{token?.metadata?.title || `ID: ${token.token_id}`}</span>
              </Accordion.Header>
              <Accordion.Body>
                <div className="nftContent">
                  <NftPreview
                    title={token.metadata?.title}
                    url={token.metadata?.media}
                    id={token.token_id}
                    owner={token.owner_id}
                  />
                  <CodeBlock language="json">{JSON.stringify(token, null, 4)}</CodeBlock>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>
      {listCapped && (
        <div>
          There’s more where that came from! We can only show 30 tokens here at a time, but you can query the rest as
          shown in the{' '}
          <PageLink route="/tutorials/nfts/enumeration" anchor="nft-tokens">
            <i>{'Enumerating tokens > NFT tokens'}</i>
          </PageLink>{' '}
          section.
        </div>
      )}
      <style jsx>{`
        .nftContent {
          display: flex;
          flex-direction: column;
          row-gap: 1rem;
        }
        .tokenList {
          display: flex;
          flex-direction: column;
          row-gap: 1rem;
          padding-bottom: 1rem;
        }
        .tokenList :global(.accordion-item) {
          background-color: transparent;
        }
        .title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
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
    <div className="previewContainer">
      <div className="imageWrapper">{url ? <Image src={url} alt="Preview of NFT media" /> : '??'}</div>
      <div className="infoWrapper">
        <div className="infoGrid">
          <span className="label">Title</span>
          <span className="title">{title}</span>
          <span className="label">ID</span>
          <span className="identifier">{id || 'unknown'}</span>
          <span className="label">Owner</span>
          <span className="owner">{owner || 'unknown'}</span>
        </div>
      </div>
      <style jsx>{`
        .previewContainer {
          display: flex;
          flex-direction: row;
          column-gap: 1rem;
          min-height: 4.5rem;
          align-items: center;
          overflow-wrap: anywhere;
        }
        .imageWrapper {
          min-width: 4.5rem;
          max-width: 4.5rem;
          height: 4.5rem;
          border: 1px solid black;
          border-radius: 0.5rem;
        }
        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .infoWrapper {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .infoGrid {
          display: grid;
          grid-template-columns: auto 1fr;
          column-gap: 1.5rem;
        }
        .label {
          font-weight: 600;
        }
      `}</style>
    </div>
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
    <div className="statusRow">
      <StatusItem title="Account" value={accountExists} />
      <StatusItem title="Contract" value={codeDeployed} />
      <StatusItem title="Initialized" value={contractInitialized} />
      <style jsx>{`
        .statusRow {
          display: flex;
          flex-direction: row;
          column-gap: 1rem;
        }
      `}</style>
    </div>
  );
}

// displays a check mark and label for a specific status check
function StatusItem({ title, value }: { title: string; value: boolean }) {
  return (
    <div className="item">
      <FontAwesomeIcon icon={value ? faCheckCircle : faCircle} color={value ? '#28A745' : 'black'} />
      <span>{title}</span>
      <style jsx>{`
        .item {
          display: flex;
          flex-direction: row;
          column-gap: 0.25rem;
          align-items: center;
        }
      `}</style>
    </div>
  );
}

// indicator that there has been an error fetching data from RPC
function ErrorIndicator() {
  return (
    <OverlayTrigger
      trigger={['hover', 'focus']}
      placement="top"
      overlay={<Tooltip>An error occurred while fetching data. Information shown may be outdated.</Tooltip>}
    >
      <div>
        <FontAwesomeIcon icon={faExclamationCircle} size="lg" style={{ color: '#A37800' }} />
      </div>
    </OverlayTrigger>
  );
}

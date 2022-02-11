import { FormEvent, useEffect, useRef, useState } from "react";
import { Accordion, Form, Button, InputGroup, OverlayTrigger, Tooltip } from "react-bootstrap";
import IconButton from "./IconButton";
import CodeBlock from "./CodeBlock";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faChevronUp, faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { useContractInfo, useMetadata } from "../utils/chainData";

import { ContractMetadata, NftData, Token, TokenMetadata } from "../utils/chainData"
import { getCurrentUserData, updateCurrentUserData, updateUserData } from '../utils/cache';
import { useRouteParam } from '../utils/hooks';


export default function NftInfoCard() {
    const [isEditing, setIsEditing] = useState<boolean>(true);
    const [contractAddress, setContractAddress] = useState<string | null>(null);
    const [addressInputValue, setAddressInputValue] = useState<string>('');
    const [showQuickInfo, setShowQuickInfo] = useState<boolean | null>(true);

    // fetch NFT contract address from local storage at startup
    const project = useRouteParam('project');
    useEffect(() => {
        if (!project) {
            return;
        }

        let userData;
        try {
            userData = getCurrentUserData();
            let cachedContractAddress = userData?.projectData[project]?.nftContract;
            if (cachedContractAddress) {
                console.log(`loaded cached contract address`)
                setContractAddress(cachedContractAddress)
                setIsEditing(false);
                setAddressInputValue(cachedContractAddress);
            }
        } catch (e) {
            // silently fail
        }
    }, [project]);

    // fetch basic account info for the NFT contract
    const { data: contractBasics, error: basicsError, isValidating: basicsLoading } = useContractInfo(contractAddress);

    // fetch full NFT contract data based on functions required by nft-1.0.0
    const { data: nftData, error: nftError } = useMetadata('NFT', contractAddress && contractBasics?.accountExists && contractBasics?.codeDeployed ? contractAddress : null);

    // track the value of the input field without updated the value which is actually fetched
    async function handleAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
        setAddressInputValue(e.target.value);
    }

    // update the contract address for data fetching
    function saveAddressChange(e: FormEvent) {
        e.preventDefault();
        setContractAddress(addressInputValue);
        setIsEditing(false);

        if (project) {
            updateCurrentUserData({ projectData: { [project]: { nftContract: addressInputValue } } })
        }
    }

    function toggleQuickInfo() {
        setShowQuickInfo(!showQuickInfo);
    }

    let metadataError;
    if (nftData?.errors.metadata === 'METHOD_NOT_IMPLEMENTED') {
        metadataError = 'Function nft_metadata() not implemented';
    } else if (nftData?.errors.metadata) {
        metadataError = 'Couldn\'t fetch metadata from nft_metadata()';
    }

    // NOTE: intentionally leaving in commented out versions of nftContractCard and toggle as stub for animation work. Animation
    // works for a static height but does not properly handle the different states of the card and their respective heights

    // return <div className={`nftContractCard${nftData?.metadata ? ' openNftCard' : ''}${showQuickInfo !== null ? (showQuickInfo ? ' animateDown' : ' animateUp') : ''}`}>
    return <div className={`nftContractCard${showQuickInfo ? ' openNftCard' : ' closedNftCard'}`}>
        <div className="titleRow">
            <h2 className="quickInfoHeader">Live Contract Data</h2>
            {(basicsError || nftError) && <ErrorIndicator />}
            {/* <div onClick={toggleQuickInfo} className={showQuickInfo !== null ? (showQuickInfo ? 'animateClosed' : 'animateOpen') : ''}>
                <FontAwesomeIcon icon={faChevronUp} size='2x' />
            </div> */}
            <div onClick={toggleQuickInfo} className={showQuickInfo ? '' : 'collapsedToggle'}>
                <FontAwesomeIcon icon={faChevronUp} size='2x' />
            </div>
        </div>
        {!contractAddress && <span className="quickInfoInstructions">I’ll show you contract metrics here. Paste in your NFT contract address below and info will update here as you progress through the tutorial.</span>}

        {/* contract address input */}
        {isEditing || !contractAddress ? <Form className="contractForm" onSubmit={saveAddressChange}>
            <InputGroup>
                <Form.Control
                    placeholder='contract.testnet'
                    value={addressInputValue}
                    onChange={handleAddressChange}
                />
                <Button type='submit'>Save</Button>
            </InputGroup>
        </Form>
            : <div className="address">
                <b className="addressText">{contractAddress}</b>
                <Button variant='outline-primary' onClick={() => { setIsEditing(true) }}>Edit</Button>
            </div>}
        {contractAddress && contractBasics && <div className="infoCardContent">
            {/* status */}
            {contractBasics && <StatusRow accountExists={!!contractBasics?.accountExists} codeDeployed={!!contractBasics?.codeDeployed} contractInitialized={!!nftData?.initialized} />}

            {metadataError && <div className='errorText'>{metadataError}</div>}
            {nftData && nftData.claimsSpec && nftData.initialized && <NftInfo nftData={nftData} />}
        </div>}
        <style jsx>{`
          .nftContractCard {
              position: fixed;
              z-index: 2;
              right: 2rem;
              width: 30rem;
              border-radius: 0.5rem;
              background-color: #F2F2F2;
              display: flex;
              flex-direction: column;
              padding: 1rem;
              row-gap: 1rem;
              box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
              overflow-y: auto;
              max-height: 40rem;
          }
          .infoCardContent {
              display: flex;
              flex-direction: column;
              row-gap: 1rem;
              transition: display 250ms;
          }

          .openNftCard {
            bottom: 2rem;
          }
          .closedNftCard {
            top: calc(100vh - 4.5rem);
            overflow-y: hidden;
          }

          .collapsedToggle {
              transform: rotate(180deg);
          }

          .errorText {
              color: #DC3545;
          }

          /* .animateUp {
            animation: slide-up 0.7s both;
          }
          @keyframes slide-up {
            0% {
                transform: translateY(38rem);
            }
            100% {
                transform: translateY(0rem);
            }
          }
          .animateDown {
            animation: slide-down 0.7s both;
          }
          @keyframes slide-down {
            0% {
                transform: translateY(0);
            }
              
            100% {
                transform: translateY(38rem);
            }
          }
          .animateOpen {
            animation: spin-open 0.7s both;
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
            animation: spin-closed 0.7s both;
          }
          @keyframes spin-closed {
            0% {
                transform: rotate(180deg);
            }
              
            100% {
                transform: rotate(0deg);
            }
          } */

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
          .status {
              align-self: flex-end;
          }
        `}</style>
    </div>
}

function NftInfo({ nftData }: { nftData: NftData }) {

    let tokenError;
    if (nftData?.errors.tokenJson === 'METHOD_NOT_IMPLEMENTED') {
        tokenError = 'Function nft_tokens() not implemented';
    } else if (nftData?.errors.tokenJson) {
        tokenError = 'Couldn\'t fetch list of tokens from nft_tokens()';
    }

    return <>
        {/* metadata */}
        <div className="metaFlex">
            {nftData?.metadata && <NftOverview metadata={nftData.metadata} supply={nftData.supply} supplyError={!!nftData.errors.supply} />}
            {nftData?.errors.metadata && <div className="errorText">Couldn&#39;t fetch contract metadata from nft_metadata()</div>}
        </div>

        {/* token list */}
        <div className='tokensTitle'>Tokens</div>
        {tokenError && <div className="errorText">{tokenError}</div>}
        {nftData?.tokenJson && <TokenList tokenJson={nftData.tokenJson} />}
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
            color: #DC3545;
          }
        `}</style>
    </>
}

function NftOverview({ metadata, supply, supplyError }: { metadata: ContractMetadata, supply?: number, supplyError: boolean }) { // TODO metadata interface
    return <div className="infoGrid">
        <span className="label">Name</span><span className="name"> {metadata.name}</span>
        <span className="label">Spec</span><span className="spec"> {metadata.spec ?? 'unknown'}</span>
        <span className="label">Symbol</span><span className="symbol">{metadata.symbol}</span>
        <span className="label">Minted</span><span className="supply">{supplyError ? <span className="errorText">Couldn&#39;t fetch count of minted tokens from nft_total_supply()</span> : supply}</span>
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
            color: #DC3545;
          }
        `}</style>
    </div>
}

function TokenList({ tokenJson }: { tokenJson: Token[] }) {
    return (
        <div className='tokenList'>
            <Accordion>
                {tokenJson.map((token: Token) => {
                    if (!token.token_id) {
                        return;
                    }
                    return <Accordion.Item eventKey={token.token_id} key={token.token_id}>
                        <Accordion.Header>{token?.metadata?.title || `ID: ${token.token_id}`}</Accordion.Header>
                        <Accordion.Body>
                            <div className="nftContent">
                                <NftPreview title={token.metadata?.title} url={token.metadata?.media} id={token.token_id} owner={token.owner_id} />
                                <CodeBlock language='json'>{JSON.stringify(token, null, 4)}</CodeBlock>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                })}
            </Accordion>
            <style jsx>{`
              .nftContent {
                  display: flex;
                  flex-direction: column;
                  row-gap: 1rem;
              }
              .tokenList :global(.accordion-item) {
                  background-color: transparent;
              }
            `}</style>
        </div>
    )
}

function NftPreview({ url, title, id, owner }: { url?: string | null, title?: string | null, id?: string | null, owner?: string | null }) {

    return <div className="previewContainer">
        <div className="imageWrapper">
            {url ? <img src={url} alt="Preview of NFT media" /> : '??'}
        </div>
        <div className="infoWrapper">
            <div className="infoGrid">
                <span className="label">Title</span><span className="title">{title}</span>
                <span className="label">ID</span><span className="identifier">{id || 'unknown'}</span>
                <span className="label">Owner</span><span className="owner">{owner || 'unknown'}</span>
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
}

function StatusRow({ accountExists, codeDeployed, contractInitialized }: { accountExists: boolean, codeDeployed: boolean, contractInitialized: boolean }) {
    return <div className="statusRow">
        <StatusItem title='Account' value={accountExists} />
        <StatusItem title='Contract' value={codeDeployed} />
        <StatusItem title='Initialized' value={contractInitialized} />
        <style jsx>{`
          .statusRow {
              display: flex;
              flex-direction: row;
              column-gap: 1rem;
          }
        `}</style>
    </div>
}

function StatusItem({ title, value }: { title: string, value: boolean }) {
    return <div className="item">
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
}

function ErrorIndicator() {
    return (
        <OverlayTrigger
            trigger={['hover', 'focus']}
            placement='top'
            overlay={
                <Tooltip>
                    An error occurred while fetching data. Information shown may be outdated.
                </Tooltip>
            }
        >
            <div>
                <FontAwesomeIcon icon={faExclamationCircle} size='lg' style={{ color: '#FFC10A' }} />
            </div>
        </OverlayTrigger>
    );
}
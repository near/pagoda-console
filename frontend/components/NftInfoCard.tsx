import { FormEvent, useEffect, useRef, useState } from "react";
import { Accordion, Form, Button, InputGroup } from "react-bootstrap";
import IconButton from "./IconButton";
import CodeBlock from "./CodeBlock";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faChevronUp } from "@fortawesome/free-solid-svg-icons";
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


    const { data: contractBasics, error: basicsError, isValidating: basicsLoading } = useContractInfo(contractAddress);

    // TODO only fetch if contract has code
    const { data: nftData, error: nftError, isValidating: nftLoading } = useMetadata('NFT', contractBasics ? contractAddress : null);


    // TODO handle nftData errors
    if (nftData) {
        // debugger;
    }

    async function handleAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
        setAddressInputValue(e.target.value);
    }

    function saveAddressChange(e: FormEvent) {
        e.preventDefault();
        setContractAddress(addressInputValue);
        setIsEditing(false);

        if (project) {
            updateCurrentUserData({ projectData: { [project]: { nftContract: addressInputValue } } })
        }
    }

    function getStatusText() {
        if (contractBasics && contractBasics.code_hash) {
            // we have an account at the address
            if (contractBasics.code_hash === '11111111111111111111111111111111') {
                return 'Account created. Waiting on contract code';
            } else {
                return 'Address has contract code ✅';
            }
        } else if (basicsError) {
            switch (basicsError.type) {
                case 'AccountDoesNotExist':
                    return 'Account does not currently exist'; // TODO more instructions on creation?
                    break;
                default:
                    return 'Something went wrong'; // TODO
            }
        }


        return '?????'; // TODO
    }

    function toggleQuickInfo() {
        // console.log(`setting to ${!!(showQuickInfo || showQuickInfo === null)}`);
        // setShowQuickInfo(!!(showQuickInfo || showQuickInfo === null));
        if (showQuickInfo || showQuickInfo === null) {
            setShowQuickInfo(false);
        } else {
            setShowQuickInfo(true);
        }
    }

    // NOTE: intentionally leaving in commented out versions of nftContractCard and toggle as stub for animation work. Animation
    // works for a static height but does not properly handle the different states of the card and their respective heights

    // return <div className={`nftContractCard${nftData?.metadata ? ' openNftCard' : ''}${showQuickInfo !== null ? (showQuickInfo ? ' animateDown' : ' animateUp') : ''}`}>
    return <div className={`nftContractCard${showQuickInfo ? ' openNftCard' : ' closedNftCard'}`}>
        <div className="titleRow">
            <h2 className="quickInfoHeader">Live Contract Data</h2>
            {/* <div onClick={toggleQuickInfo} className={showQuickInfo !== null ? (showQuickInfo ? 'animateClosed' : 'animateOpen') : ''}>
                <FontAwesomeIcon icon={faChevronUp} size='2x' />
            </div> */}
            <div onClick={toggleQuickInfo} className={showQuickInfo ? '' : 'collapsedToggle'}>
                <FontAwesomeIcon icon={faChevronUp} size='2x' />
            </div>
        </div>
        <div className="infoCardContent">
            {!contractAddress && <span className="quickInfoInstructions">I’ll show you contract metrics here. Paste in your NFT contract address below and info will update here as you progress through the tutorial.</span>}
            {isEditing || !contractAddress ? <Form className="contractForm" onSubmit={saveAddressChange}>
                <InputGroup>
                    <Form.Control
                        //   isInvalid={Boolean(error)}
                        placeholder='contract.testnet'
                        value={addressInputValue}
                        onChange={handleAddressChange}
                    />
                    <Button type='submit'>Save</Button>
                </InputGroup>
            </Form>
                : <div className="address">
                    <span className="addressText">{contractAddress}</span>
                    <IconButton onClick={() => { setIsEditing(true) }} icon={faPen} />
                </div>}
            {contractAddress && <span className="status">{getStatusText()}</span>}
            <div className="metaFlex">{nftData?.metadata && <NftBasicInfo metadata={nftData.metadata} supply={nftData.supply} />}</div>
            {nftData?.tokenJson && <TokenList tokenJson={nftData.tokenJson} />}
            {/* <pre><code>basics: {JSON.stringify(contractBasics, null, 4)}</code></pre> */}
            {/* {basicsError && <pre><code>basicsError: {JSON.stringify(basicsError, null, 4)}</code></pre>} */}
            {/* {basicsError?.cause?.message && <pre><code>basicsError.cause: {JSON.stringify(basicsError.cause.message, null, 4)}</code></pre>} */}
            {/* {typeof basicsError?.cause} */}
            {/* <pre><code>data: {JSON.stringify(nftData, null, 4)}</code></pre> */}
            {/* <p>error: {JSON.stringify(nftError)}</p> */}
        </div>
        <style jsx>{`
          .nftContractCard {
              position: fixed;
              z-index: 2;
              right: 2rem;
              width: 30rem;
              border-radius: 0.5rem;
              background-color: var(--color-bg-primary);
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

          .metaFlex {
              flex: 0;
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
              align-items: center;
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

function NftBasicInfo({ metadata, supply }: { metadata: ContractMetadata, supply?: number }) { // TODO metadata interface
    return <div className="infoGrid">
        <span className="label">Name</span><span className="name"> {metadata.name}</span>
        <span className="label">Spec</span><span className="spec"> {metadata.spec ?? 'unknown'}</span>
        <span className="label">Symbol</span><span className="symbol"> {metadata.symbol}</span>
        <span className="label">Minted</span><span className="supply"> {supply ?? 'unknown'}</span>
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
        `}</style>
    </div>
}

function TokenList({ tokenJson }: { tokenJson: Token[] }) {
    return (
        <>
            <span className='title'>Tokens</span>
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
              .title {
                  font-size: 1.75rem;
                  font-weight: 700;
              }
              .nftContent {
                  display: flex;
                  flex-direction: column;
                  row-gap: 1rem;
              }
            `}</style>
        </>
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
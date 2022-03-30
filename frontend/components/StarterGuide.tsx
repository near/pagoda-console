import { useEffect, useState } from 'react';
import { Accordion } from 'react-bootstrap';

import Config from '@/utils/config';
import { useApiKeys } from '@/utils/fetchers';
import { useRouteParam } from '@/utils/hooks';
import type { NetOption } from '@/utils/interfaces';

import CodeBlock from './CodeBlock';

const NAJ_STARTER_TEMPLATE = `const { connect, keyStores } = require("near-api-js");

// Can be an empty object if not signing transactions

const keyStore = new keyStores.BrowserLocalStorageKeyStore();

const RPC_API_ENDPOINT = '<RPC service url>';
const API_KEY = '<your API Key>';

const ACCOUNT_ID = 'account.near';

const config = {
    networkId: 'testnet',
    keyStore,
    nodeUrl: RPC_API_ENDPOINT,
    headers: { 'x-api-key': API_KEY },
};

// Example: Fetching account status

async function getState(accountId) {
    const near = await connect(config);
    const account = await near.account(accountId);
    const state = await account.state();
    console.log(state);
}

getState(ACCOUNT_ID);`;

const RUST_STARTER_TEMPLATE = `use near_jsonrpc_client::{auth, methods, JsonRpcClient};
use near_primitives::types::{BlockReference, Finality};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = JsonRpcClient::connect("<RPC service url>")
        .header(auth::ApiKey::new("<your API Key>")?);

    let request = methods::block::RpcBlockRequest {
        block_reference: BlockReference::Finality(Finality::Final),
    };

    let response = client.call(request).await?;

    println!("{:?}", response);

    Ok(())
}`;

const CLI_URL_TEMPLATE = `export NEAR_CLI_TESTNET_RPC_SERVER_URL=<RPC service url>`;
const CLI_KEY_TEMPLATE = `near set-api-key $NEAR_CLI_TESTNET_RPC_SERVER_URL <your API Key>`;

export default function StarterGuide() {
  const [starterCode, setstarterCode] = useState<{ naj: string; rust: string; cliUrl: string; cliKey: string }>({
    naj: NAJ_STARTER_TEMPLATE,
    rust: RUST_STARTER_TEMPLATE,
    cliUrl: CLI_URL_TEMPLATE,
    cliKey: CLI_KEY_TEMPLATE,
  });

  const projectSlug = useRouteParam('project');
  const { keys } = useApiKeys(projectSlug, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // TODO (P2+) determine net by other means than subId
  const environmentSubIdRaw = useRouteParam('environment');
  const environmentSubId = typeof environmentSubIdRaw === 'string' ? parseInt(environmentSubIdRaw) : null;

  useEffect(() => {
    const net: NetOption = environmentSubId === 2 ? 'MAINNET' : 'TESTNET';
    if (!environmentSubId || !keys || !keys[net]) {
      return;
    }
    // setupCode = keys?.TESTNET ? `near set-api-key ${Config.url.rpc.default[net]} ${keys?.[net]}` : '';
    setstarterCode({
      naj: NAJ_STARTER_TEMPLATE.replace(/<your API Key>/, keys[net]!).replace(
        /<RPC service url>/,
        Config.url.rpc.recommended[net],
      ),
      rust: RUST_STARTER_TEMPLATE.replace(/<your API Key>/, keys[net]!).replace(
        /<RPC service url>/,
        Config.url.rpc.recommended[net],
      ),
      cliUrl: CLI_URL_TEMPLATE.replace(/<your API Key>/, keys[net]!).replace(
        /<RPC service url>/,
        Config.url.rpc.recommended[net],
      ),
      cliKey: CLI_KEY_TEMPLATE.replace(/<your API Key>/, keys[net]!),
    });
  }, [keys, environmentSubId]);

  return (
    <div className="guideContainer">
      <h4>Using Your API Keys</h4>
      <div className="intro">
        Follow the instructions below to get started with making requests to the NEAR RPC service.
        {keys && " We've already filled in your API keys in these instructions."}
      </div>
      <div className="examples">
        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>Command Line (near-cli)</Accordion.Header>
            <Accordion.Body>
              <ol>
                <li>
                  If you don&#39;t yet have near-cli installed on your machine, follow the instructions in the{' '}
                  <a
                    href="https://docs.near.org/docs/tools/near-cli#installation"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    near-cli installation documentation
                  </a>
                  .
                </li>
                <li>Set your RPC URL:</li>
                <CodeBlock language="bash">{starterCode.cliUrl}</CodeBlock>
                <li>Configure your API key:</li>
                <CodeBlock language="bash">{starterCode.cliKey}</CodeBlock>
              </ol>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        <Accordion>
          <Accordion.Item eventKey="1">
            <Accordion.Header>Javascript (near-api-js)</Accordion.Header>
            <Accordion.Body>
              <ol>
                <li>
                  If you don&#39;t yet have near-api-js installed in your project, follow the instructions from the{' '}
                  <a
                    href="https://docs.near.org/docs/api/naj-quick-reference#install"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    near-api-js quick reference guide
                  </a>
                  .
                </li>
                <li>Add the following code to get started:</li>
                <CodeBlock language="javascript">{starterCode.naj}</CodeBlock>
              </ol>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        <Accordion>
          <Accordion.Item eventKey="2">
            <Accordion.Header>Rust (near-jsonrpc-client)</Accordion.Header>
            <Accordion.Body>
              <p>Example of asynchronously fetching the latest block using tokio:</p>
              <CodeBlock language="rust">{starterCode.rust}</CodeBlock>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
      <style jsx>{`
        .guideContainer {
          display: flex;
          flex-direction: column;
          row-gap: 1rem;
        }
        li {
          margin-bottom: 1rem;
        }
        .examples {
          display: flex;
          flex-direction: column;
          row-gap: 0.75rem;
        }
      `}</style>
    </div>
  );
}

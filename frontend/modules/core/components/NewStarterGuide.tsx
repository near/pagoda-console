import { useEffect, useState } from 'react';

import * as Accordion from '@/components/lib/Accordion';
import { Badge } from '@/components/lib/Badge';
import { CodeBlock } from '@/components/lib/CodeBlock';
import { Flex } from '@/components/lib/Flex';
import { H4 } from '@/components/lib/Heading';
import { List, ListItem } from '@/components/lib/List';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { useSelectedProject } from '@/hooks/selected-project';
import config from '@/utils/config';
import type { NetOption } from '@/utils/types';

const NAJ_STARTER_TEMPLATE = `const { connect, keyStores } = require("near-api-js");

// Can be an empty object if not signing transactions

const keyStore = new keyStores.BrowserLocalStorageKeyStore();

const RPC_API_ENDPOINT = '<RPC service url>';
const API_KEY = '<YOUR-API-KEY>';

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
        .header(auth::ApiKey::new("<YOUR-API-KEY>")?);

    let request = methods::block::RpcBlockRequest {
        block_reference: BlockReference::Finality(Finality::Final),
    };

    let response = client.call(request).await?;

    println!("{:?}", response);

    Ok(())
}`;

const CLI_URL_TEMPLATE = `export NEAR_CLI_TESTNET_RPC_SERVER_URL=<RPC service url>`;
const CLI_KEY_TEMPLATE = `near set-api-key $NEAR_CLI_TESTNET_RPC_SERVER_URL <your API Key>`;
const TEST_API_KEYS = `curl -X POST -H 'x-api-key:<YOUR-API-KEY>' -H 'Content-Type: application/json' -d '{"jsonrpc": "2.0", "id":"dontcare","method":"status","params":[] }' https://near-testnet.api.pagoda.co/`;

export default function NewStarterGuide() {
  const [starterCode, setStarterCode] = useState<{ naj: string; rust: string; cliUrl: string; cliKey: string }>({
    naj: NAJ_STARTER_TEMPLATE,
    rust: RUST_STARTER_TEMPLATE,
    cliUrl: CLI_URL_TEMPLATE,
    cliKey: CLI_KEY_TEMPLATE,
  });

  const { environment } = useSelectedProject();

  // TODO (P2+) determine net by other means than subId
  useEffect(() => {
    const net: NetOption = environment?.subId === 2 ? 'MAINNET' : 'TESTNET';

    if (!environment?.subId) {
      return;
    }

    setStarterCode({
      naj: NAJ_STARTER_TEMPLATE.replace(/<RPC service url>/, config.url.rpc.recommended[net]),
      rust: RUST_STARTER_TEMPLATE.replace(/<RPC service url>/, config.url.rpc.recommended[net]),
      cliUrl: CLI_URL_TEMPLATE.replace(/<RPC service url>/, config.url.rpc.recommended[net]),
      cliKey: CLI_KEY_TEMPLATE,
    });
  }, [environment]);

  return (
    <Flex stack gap="l">
      <Flex stack>
        <H4>Using Your API Keys</H4>

        <Text>
          Use your API key to access Pagoda API (in Beta) to use RPC and Enhanced APIs. Unlock insights from the
          Statistics Page into your RPC usage and performance (e.g. latency, success%), subscribe to updates from Status
          page to get notified and react when incidents happened, and upgrade your data query experiences with instant
          access to balances and more with Enhanced APIs.
        </Text>
        <Text weight="semibold">Quick Endpoint Setup</Text>
        <List as="ul">
          <ListItem>
            Endpoint URL varies by network, shared for both RPC and Enhanced API Access
            <List as="ul">
              <ListItem>
                <Badge size="s">https://near-testnet.api.pagoda.co</Badge>
              </ListItem>
              <ListItem>
                <Badge size="s">https://near-mainnet.api.pagoda.co</Badge>
              </ListItem>
            </List>
          </ListItem>
          <ListItem>
            RPC API Access
            <List as="ul">
              <ListItem>
                <Badge size="s">POST</Badge> for all RPC methods
              </ListItem>
              <ListItem>
                <Badge size="s">JSON RPC 2.0</Badge>
              </ListItem>
              <ListItem>
                <Badge size="s">id: &quot;dontcare&quot;</Badge>
              </ListItem>
            </List>
          </ListItem>
          <ListItem>
            Enhanced API Access
            <List as="ul">
              <ListItem>Follows RESTful API design</ListItem>
              <ListItem>
                Default Content Type: <Badge size="s">application/json</Badge>
              </ListItem>
              <ListItem>
                The API key should be set as <Badge size="s">x-api-key</Badge> HTTP Header for each Enhanced API call
              </ListItem>
            </List>
          </ListItem>
        </List>
        <Text>Pagoda RPC service follows NEAR RPC standards.</Text>
        <Text>
          Refer to the{' '}
          <TextLink href="https://docs.near.org/api/overview" external>
            NEAR API Documentation
          </TextLink>{' '}
          for the list of JSON RPC methods to interact with the NEAR blockchain and instructions below in the dropdown
          to get started.
        </Text>
        <Text>Refer to the Enhanced API tab for instructions and documentation to use Enhanced APIs.</Text>
        <Text weight="semibold">Instructions to get started with making requests to the Pagoda RPC service.</Text>
      </Flex>

      <Accordion.Root type="multiple" inline>
        <Accordion.Item value="test">
          <Accordion.Trigger>Quickly Test your API Keys</Accordion.Trigger>
          <Accordion.Content>
            <CodeBlock language="bash">{TEST_API_KEYS}</CodeBlock>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="cli">
          <Accordion.Trigger>Command Line (near-cli)</Accordion.Trigger>
          <Accordion.Content>
            <List as="ol" gap="l">
              <ListItem>
                If you don&#39;t yet have near-cli installed on your machine, follow the instructions in the{' '}
                <TextLink href="https://docs.near.org/docs/tools/near-cli#installation" external>
                  near-cli installation docs
                </TextLink>
              </ListItem>
              <ListItem>
                <Flex stack gap="s">
                  Set your RPC URL:
                  <CodeBlock language="bash">{starterCode.cliUrl}</CodeBlock>
                </Flex>
              </ListItem>
              <ListItem>
                <Flex stack gap="s">
                  configure your API key:
                  <CodeBlock language="bash">{starterCode.cliKey}</CodeBlock>
                </Flex>
              </ListItem>
            </List>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="js">
          <Accordion.Trigger>Javascript (near-api-js)</Accordion.Trigger>
          <Accordion.Content>
            <List as="ol" gap="l">
              <ListItem>
                If you don&#39;t yet have near-api-js installed in your project, follow the instructions from the{' '}
                <TextLink
                  href="https://docs.near.org/docs/api/naj-quick-reference#install"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  near-api-js quick reference guide
                </TextLink>
                .
              </ListItem>
              <ListItem>
                <Flex stack>
                  Add the following code to get started:
                  <CodeBlock language="javascript">{starterCode.naj}</CodeBlock>
                </Flex>
              </ListItem>
            </List>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="rust">
          <Accordion.Trigger>Rust (near-jsonrpc-client)</Accordion.Trigger>
          <Accordion.Content>
            <Flex stack>
              <Text>Example of asynchronously fetching the latest block using tokio:</Text>
              <CodeBlock language="rust">{starterCode.rust}</CodeBlock>
            </Flex>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="compare">
          <Accordion.Trigger>Difference Between near-api-js and near-sdk-js</Accordion.Trigger>
          <Accordion.Content>
            <List as="ul">
              <ListItem>
                The JavaScript API is a complete library for all possible commands to interact with NEAR. It’s a wrapper
                for the RPC endpoints, a library to interact with NEAR Wallet in the browser, and a tool for keys
                management.
              </ListItem>
              <ListItem>
                <Text>
                  The JavaScript SDK is a library for developing smart contracts. It contains classes and functions you
                  use to write your smart contract code. To get started building smart contracts with near-sdk-js,
                  follow the instructions from the{' '}
                  <TextLink
                    href="https://docs.near.org/tools/near-sdk-js#create-your-first-javascript-contract"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    near-sdk-js quick reference guide
                  </TextLink>{' '}
                </Text>
              </ListItem>
            </List>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </Flex>
  );
}

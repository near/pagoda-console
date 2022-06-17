import { useEffect, useState } from 'react';

import * as Accordion from '@/components/lib/Accordion';
import { useApiKeys } from '@/hooks/api-keys';
import { useSelectedProject } from '@/hooks/selected-project';
import config from '@/utils/config';
import type { NetOption } from '@/utils/types';

import CodeBlock from './CodeBlock';
import { Flex } from './lib/Flex';
import { H4 } from './lib/Heading';
import { List, ListItem } from './lib/List';
import { Text } from './lib/Text';
import { TextLink } from './lib/TextLink';

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
  const [starterCode, setStarterCode] = useState<{ naj: string; rust: string; cliUrl: string; cliKey: string }>({
    naj: NAJ_STARTER_TEMPLATE,
    rust: RUST_STARTER_TEMPLATE,
    cliUrl: CLI_URL_TEMPLATE,
    cliKey: CLI_KEY_TEMPLATE,
  });

  const { project, environment } = useSelectedProject();

  const { keys } = useApiKeys(project?.slug, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // TODO (P2+) determine net by other means than subId
  useEffect(() => {
    const net: NetOption = environment?.subId === 2 ? 'MAINNET' : 'TESTNET';

    if (!environment?.subId || !keys || !keys[net]) {
      return;
    }

    setStarterCode({
      naj: NAJ_STARTER_TEMPLATE.replace(/<your API Key>/, keys[net]!).replace(
        /<RPC service url>/,
        config.url.rpc.recommended[net],
      ),
      rust: RUST_STARTER_TEMPLATE.replace(/<your API Key>/, keys[net]!).replace(
        /<RPC service url>/,
        config.url.rpc.recommended[net],
      ),
      cliUrl: CLI_URL_TEMPLATE.replace(/<your API Key>/, keys[net]!).replace(
        /<RPC service url>/,
        config.url.rpc.recommended[net],
      ),
      cliKey: CLI_KEY_TEMPLATE.replace(/<your API Key>/, keys[net]!),
    });
  }, [keys, environment]);

  return (
    <Flex stack>
      <H4>Using Your API Keys</H4>

      <Text>
        Follow the instructions below to get started with making requests to the NEAR RPC service.
        {keys && " We've already filled in your API keys in these instructions."}
      </Text>

      <Accordion.Root type="multiple">
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
      </Accordion.Root>
    </Flex>
  );
}

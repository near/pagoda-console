import { Box } from '@/components/lib/Box';
import { ButtonLink } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import { H1, H5 } from '@/components/lib/Heading';
import { List, ListItem } from '@/components/lib/List';
import { Section } from '@/components/lib/Section';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { useDashboardLayout } from '@/hooks/layouts';
import SailboatImage from '@/public/indexers/images/Sailboat.svg';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const Indexers: NextPageWithLayout = () => {
  return (
    <Section css={{ margin: 'auto' }}>
      <Flex stack gap={{ '@initial': 'xl', '@mobile': 'l' }}>
        <H1>Create your own indexer using NEAR Lake!</H1>

        <Flex stack={{ '@tablet': true }} align="center" gap={{ '@initial': 'xl', '@mobile': 'l' }}>
          <Box
            css={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-xl)',
              '@mobile': {
                gridTemplateColumns: '1fr',
                gap: 'var(--space-l)',
              },
            }}
          >
            <DescriptionBlock
              title="Productive"
              content="Build an indexer using our S3 JSON storage. No need to standup and sync a full node."
            />
            <DescriptionBlock
              title="Resilient"
              content="Indexer got stuck? No worries! Restart from any block and run it immediately."
            />
            <DescriptionBlock
              title="Immediate Access"
              content="Connect with the full history of the NEAR blockchain in milliseconds."
            />
            <DescriptionBlock
              title="Familiar"
              content="Write indexers in languages you're already familiar with: JavaScript, Python, or Rust."
            />
          </Box>
          <Box>
            <SailboatImage />
          </Box>
        </Flex>
        <Flex stack gap="l">
          <Text>
            NEAR Lake Framework allows you to build your own indexer that subscribes to the stream of blocks from the
            NEAR Lake data source and create your own logic to process the NEAR Protocol data.
          </Text>
          <Flex stack gap="s">
            <Text>Here are some tutorials to help you get started:</Text>
            <List>
              <ListItem>
                <TextLink
                  stableId={StableId.INDEXERS_NEAR_LAKE_RAW_PRINTER_LINK}
                  href="https://near-indexers.io/tutorials/lake/js-lake-indexer"
                  external
                >
                  near-lake-raw-printer
                </TextLink>
                : simple example of a data printer
              </ListItem>
              <ListItem>
                <TextLink
                  stableId={StableId.INDEXERS_NEAR_LAKE_ACCOUNT_WATCHER_LINK}
                  href="https://near-indexers.io/tutorials/lake/near-lake-state-changes-indexer"
                  external
                >
                  accounts-watcher
                </TextLink>
                : indexer example that watches for transactions related to specified accounts/contracts
              </ListItem>
              <ListItem>
                <TextLink
                  stableId={StableId.INDEXERS_NEAR_LAKE_NFT_INDEXER_LINK}
                  href="https://near-indexers.io/tutorials/lake/nft-indexer"
                  external
                >
                  nft-indexer
                </TextLink>
                : a working NFT indexer
              </ListItem>
            </List>
          </Flex>

          <ButtonLink
            stableId={StableId.INDEXERS_TRY_NEAR_LAKE_LINK}
            href="https://near-indexers.io/docs/projects/near-lake-framework"
            external
          >
            Try Out NEAR Lake
          </ButtonLink>
        </Flex>
      </Flex>
    </Section>
  );
};

function DescriptionBlock({ title, content }: { title: string; content: string }) {
  return (
    <Flex stack gap="xs">
      <H5>{title}</H5>
      <Text as="span">{content}</Text>
    </Flex>
  );
}

Indexers.getLayout = useDashboardLayout;

export default Indexers;

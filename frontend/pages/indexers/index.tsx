import { Box } from '@/components/lib/Box';
import { ButtonLink } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1, H5 } from '@/components/lib/Heading';
import { List, ListItem } from '@/components/lib/List';
import { Section } from '@/components/lib/Section';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { useDashboardLayout } from '@/hooks/layouts';
import SailboatImage from '@/public/indexers/images/Sailboat.svg';
import type { NextPageWithLayout } from '@/utils/types';

const Indexers: NextPageWithLayout = () => {
  return (
    <Section css={{ margin: 'auto' }}>
      <Flex stack gap="xl">
        <H1>Create your own indexer using NEAR Lake!</H1>

        <Flex>
          <Box
            css={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              columnGap: 'var(--space-l)',
              rowGap: 'var(--space-xl)',
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
              title="Cost Effective"
              content="Reduce your indexer cost by over 90% thanks to minimal RAM and disc space requirements."
            />
            <DescriptionBlock
              title="Familiar"
              content="Write indexers in languages you're already familiar with: JavaScript, Python, or Rust."
            />
          </Box>
          <Box css={{ margin: '0 var(--space-xl) 0 var(--space-xl)' }}>
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
                  href="https://near-indexers.io/tutorials/lake/js-lake-indexer"
                  target="_blank"
                  rel="noop noreferrer"
                >
                  near-lake-raw-printer
                  <FeatherIcon css={{ marginLeft: '0.25rem' }} icon="external-link" size="xs" />
                </TextLink>
                : simple example of a data printer built on top of NEAR Lake Framework
              </ListItem>
              <ListItem>
                <TextLink
                  href="https://near-indexers.io/tutorials/lake/near-lake-state-changes-indexer"
                  target="_blank"
                  rel="noop noreferrer"
                >
                  accounts-watcher
                  <FeatherIcon css={{ marginLeft: '0.25rem' }} icon="external-link" size="xs" />
                </TextLink>
                : indexer example that watches for transaction for specified accounts/contracts build on top of NEAR
                Lake Framework
              </ListItem>
              <ListItem>
                <TextLink
                  href="https://near-indexers.io/tutorials/lake/nft-indexer"
                  target="_blank"
                  rel="noop noreferrer"
                >
                  nft-indexer
                  <FeatherIcon css={{ marginLeft: '0.25rem' }} icon="external-link" size="xs" />
                </TextLink>
                : a working NFT indexer
              </ListItem>
            </List>
          </Flex>
        </Flex>
        <ButtonLink href="https://near-indexers.io/docs/projects/near-lake" external>
          Try Out NEAR Lake
        </ButtonLink>
      </Flex>
    </Section>
  );
};

function DescriptionBlock({ title, content }: { title: string; content: string }) {
  return (
    <Flex stack>
      <H5>{title}</H5>
      <Text as="span">{content}</Text>
    </Flex>
  );
}

Indexers.getLayout = useDashboardLayout;

export default Indexers;

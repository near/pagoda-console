import { styled } from '@stitches/react';

import { Badge } from '@/components/lib/Badge';
import { Box } from '@/components/lib/Box';
import { Button } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { HR } from '@/components/lib/HorizontalRule';
import { Text } from '@/components/lib/Text';
import { StableId } from '@/utils/stable-ids';

const MainCard = styled(Card, {
});

const FlexTop = styled(Flex, {
});

const BadgeTop = styled(Badge, {
});

const CopyButton = styled(Flex, {
});

const Testnet = () => {
  return (
    <Flex align="center">
      <MainCard borderRadius="m" padding="none">
        <Box padding="m" background="surface3">
          <Flex align="center">
            <Flex>
              <Text size="h5" color="text1">
                rust-template-654
              </Text>
            </Flex>
            <Flex justify="end">
              <Badge size="s" gap="xs">
                <Text size="bodySmall" color="text1">
                  dev
                </Text>
                <Text size="bodySmall" color="text3">
                  @
                </Text>
                <Text size="bodySmall" color="primary" family="number">
                  4166bf9
                </Text>
              </Badge>
            </Flex>
          </Flex>
          <FlexTop>
            <Text family="number" size="bodySmall" color="text3">
              Last Commit
            </Text>
            <Text family="number" size="bodySmall" color="text2">
              Nov 2, 10:01 AM GMT
            </Text>
          </FlexTop>
          <FlexTop>
            <Button stableId={StableId.DEPLOYS_TESTNET_REPO} size="s" color="neutral">
              <FeatherIcon size="xs" icon="external-link" /> frontend.github.io
            </Button>
          </FlexTop>
          <BadgeTop background="dark">
            <FeatherIcon size="xs" icon="zap" />
            <Text size="bodySmall" color="text1" family="number">
              dev-1334934092314-430231409
            </Text>
            <CopyButton>
              <FeatherIcon size="xs" icon="copy" />
            </CopyButton>
          </BadgeTop>
        </Box>
        <HR color="warning" />
        <Box padding="m">
          <Flex justify="end">
            <Button stableId={StableId.DEPLOYS_TESTNET_ALERTS} size="s" color="neutral">
              <FeatherIcon size="xs" icon="bell" /> Alerts
            </Button>
            <Button stableId={StableId.DEPLOYS_TESTNET_INTERACT} size="s" color="neutral">
              <FeatherIcon size="xs" icon="terminal" /> Interact
            </Button>
            <Button stableId={StableId.DEPLOYS_TESTNET_MORE} size="s" color="neutral">
              <FeatherIcon size="xs" icon="more-vertical" />
            </Button>
          </Flex>
        </Box>
      </MainCard>
    </Flex>
  );
};

export default Testnet;

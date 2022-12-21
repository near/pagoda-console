import type { Api } from '@pc/common/types/api';
import { QRCodeSVG } from 'qrcode.react';

import { Box } from '@/components/lib/Box';
import { ButtonLink } from '@/components/lib/Button';
import { CopyButton } from '@/components/lib/CopyButton';
import { Flex } from '@/components/lib/Flex';
import { H5 } from '@/components/lib/Heading';
import { HR } from '@/components/lib/HorizontalRule';
import { Text } from '@/components/lib/Text';
import config from '@/utils/config';
import { StableId } from '@/utils/stable-ids';

type Destination = Api.Query.Output<'/alerts/listDestinations'>[number];

interface Props {
  destination: Destination;
}

export function TelegramDestinationVerification({ destination }: Props) {
  const { telegramBotHandle } = config;

  if (destination.type !== 'TELEGRAM') return null;
  if (!telegramBotHandle) throw new Error('Missing environment variable: NEXT_PUBLIC_TELEGRAM_BOT_HANDLE');

  const startCommand = `/start ${destination.config.startToken}`;
  const telegramUrl = `https://t.me/${telegramBotHandle}?start=${destination.config.startToken}`;

  return (
    <Flex stack gap="l">
      <Text>
        To finish setting up this destination, you need to connect with our Telegram bot. You have two options below:
      </Text>

      <HR />

      <Flex stack>
        <H5>Private Message</H5>

        <Flex align="center" stack={{ '@mobile': true }}>
          <Box
            css={{
              background: '#ffffff',
              padding: 'var(--space-s)',
              borderRadius: 'var(--border-radius-s)',
              fontSize: 0,
            }}
          >
            <QRCodeSVG
              value={telegramUrl}
              size={128}
              bgColor="#ffffff"
              fgColor="#101110"
              level="M"
              imageSettings={{
                src: '/images/brand/pagoda-icon.svg',
                height: 32,
                width: 32,
                excavate: true,
              }}
            />
          </Box>

          <Text>OR</Text>

          <ButtonLink
            stableId={StableId.TELEGRAM_DESTINATION_VERIFICATION_OPEN_TELEGRAM_LINK}
            href={telegramUrl}
            external
          >
            Open Telegram
          </ButtonLink>
        </Flex>
      </Flex>

      <HR />

      <Flex stack>
        <H5>Group Message</H5>

        <Text>
          Start a Telegram group chat and include{' '}
          <CopyButton
            stableId={StableId.TELEGRAM_DESTINATION_VERIFICATION_COPY_BOT_HANDLE_BUTTON}
            content={config.telegramBotHandle}
          />{' '}
          then send the following message:{' '}
          <CopyButton
            stableId={StableId.TELEGRAM_DESTINATION_VERIFICATION_COPY_MESSAGE_BUTTON}
            content={startCommand}
          />
        </Text>
      </Flex>
    </Flex>
  );
}

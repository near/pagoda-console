import { QRCodeSVG } from 'qrcode.react';

import { Box } from '@/components/lib/Box';
import { ButtonLink } from '@/components/lib/Button';
import { CopyButton } from '@/components/lib/CopyButton';
import { Flex } from '@/components/lib/Flex';
import { H5 } from '@/components/lib/Heading';
import { Text } from '@/components/lib/Text';
import config from '@/utils/config';

import type { Destination } from '../utils/types';

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

      <Flex stack>
        <H5>Private Message</H5>

        <Flex align="center">
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

          <ButtonLink href={telegramUrl} external>
            Open Telegram
          </ButtonLink>
        </Flex>
      </Flex>

      <Flex stack>
        <H5>Group Message</H5>

        <Text>
          Start a Telegram group chat and include <CopyButton content={config.telegramBotHandle} /> then send the
          following message: <CopyButton content={startCommand} />
        </Text>
      </Flex>
    </Flex>
  );
}

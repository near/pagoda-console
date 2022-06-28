import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import IconSvg from '@/public/images/maintenance.svg';
import config from '@/utils/config';
import { assertUnreachable } from '@/utils/helpers';

export function DowntimeMode() {
  if (!config.downtimeMode) return <></>;

  let message = '';

  switch (config.downtimeMode) {
    case 'maintenance':
      message = 'Sorry, we are currently down for maintenance.\nPlease check back again soon.';
      break;
    case 'unexpected':
      message = 'Sorry, some of our services are offline due to an unexpected outage.\nPlease check back again soon.';
      break;
    case 'custom':
      message = config.downtimeMessage;
      break;
    default:
      assertUnreachable(config.downtimeMode);
  }

  return (
    <Flex gap="l" stack align="center">
      <IconSvg style={{ width: '114px', height: 'auto', maxWidth: '100%' }} />

      <Text size="h5" css={{ whiteSpace: 'pre-line', textAlign: 'center' }}>
        {message}
      </Text>
    </Flex>
  );
}

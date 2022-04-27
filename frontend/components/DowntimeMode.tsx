import IconSvg from '@/public/images/maintenance.svg';
import config from '@/utils/config';
import { assertUnreachable } from '@/utils/helpers';

export default function DowntimeMode() {
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
    <>
      <div className="iconContainer">
        <IconSvg style={{ width: '114px', height: 'auto', maxWidth: '100%' }} />
      </div>

      <p className="message">{message}</p>

      <style jsx>{`
        .iconContainer {
          margin-top: 1rem;
          margin-bottom: 3rem;
        }

        .message {
          font-size: 1.25rem;
          text-align: center;
          white-space: pre-line;
        }
      `}</style>
    </>
  );
}

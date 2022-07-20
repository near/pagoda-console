import { DateTime } from 'luxon';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Badge } from '@/components/lib/Badge';
import { Card } from '@/components/lib/Card';
import { Container } from '@/components/lib/Container';
import { CopyButton } from '@/components/lib/CopyButton';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { HR } from '@/components/lib/HorizontalRule';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { TextOverflow } from '@/components/lib/TextOverflow';
import { wrapDashboardLayoutWithOptions } from '@/hooks/layouts';
import { useSelectedProjectSync } from '@/hooks/selected-project';
import { useAlert } from '@/modules/alerts/hooks/alerts';
import { useTriggeredAlertDetails } from '@/modules/alerts/hooks/triggered-alerts';
import { alertTypes } from '@/modules/alerts/utils/constants';
import type { Alert, TriggeredAlert } from '@/modules/alerts/utils/types';
import type { NextPageWithLayout } from '@/utils/types';

function LabelAndValue(props: { label: string; value: string; linkToExplorer?: boolean; explorerPrefix?: string }) {
  const initializedExplorerPrefix = props.explorerPrefix || 'transactions';
  return (
    <Flex align="center" justify="start">
      <Text size="body" css={{ minWidth: '10rem' }}>
        {props.label}
      </Text>
      <Flex justify="end">
        {props.linkToExplorer ? (
          <>
            <TextLink size="s" external href={`https://explorer.near.org/${initializedExplorerPrefix}/${props.value}`}>
              {props.value}
            </TextLink>
            <CopyButton value={props.value} />
          </>
        ) : (
          <Text size="bodySmall">{props.value}</Text>
        )}
      </Flex>
    </Flex>
  );
}

const ViewTriggeredAlert: NextPageWithLayout = () => {
  const router = useRouter();
  const triggeredAlertId = router.query.triggeredAlertId as string;
  const { triggeredAlert, error } = useTriggeredAlertDetails(triggeredAlertId);
  const { alert } = useAlert(triggeredAlert?.alertId);
  useSelectedProjectSync(alert?.environmentSubId, alert?.projectSlug);

  function alertType(triggeredAlert: TriggeredAlert) {
    if (!triggeredAlert) return alertTypes.EVENT;
    return alertTypes[triggeredAlert.type];
  }

  function alertContract(alert: Alert) {
    return alert?.rule?.contract;
  }

  const triggeredAtDateFormatted = triggeredAlert
    ? DateTime.fromISO(triggeredAlert.triggeredAt)?.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
    : '';

  return (
    <Section>
      <Flex gap="l" stack={{ '@laptop': true }}>
        <Link href="/alerts?tab=activity" passHref>
          <TextLink>
            <FeatherIcon icon="arrow-left" />
            Activity
          </TextLink>
        </Link>

        {(triggeredAlert === undefined || alert === undefined) && error === undefined && <Spinner center />}

        {error && (
          <Container size="m">
            <Card>
              <Flex stack align="center">
                <FeatherIcon icon="bell-off" size="l" />
                <Text>{`No Triggered Alert with this ID was found.`}</Text>
              </Flex>
            </Card>
          </Container>
        )}

        {triggeredAlert && alert && !error && (
          <Flex align="start">
            <Container size="m">
              <Card>
                <Flex stack>
                  <Flex stack gap="none">
                    <Flex align="center" justify="spaceBetween">
                      <Flex>
                        <FeatherIcon icon="bell" size="m" />
                        <TextOverflow>{triggeredAlert.name}</TextOverflow>
                      </Flex>
                      <Flex justify="end">
                        <Badge size="s" css={{ borderRadius: '0px' }}>
                          <FeatherIcon icon={alertType(triggeredAlert).icon} size="xs" />
                          {alertType(triggeredAlert).name}
                        </Badge>
                      </Flex>
                    </Flex>
                    <Text size="bodySmall" css={{ paddingLeft: '3rem' }} color="text3">
                      {alertContract(alert)}
                    </Text>
                  </Flex>
                  <HR />
                  <LabelAndValue label="Alert Triggered at" value={triggeredAtDateFormatted} />
                  <LabelAndValue
                    label="Transaction Hash"
                    value={triggeredAlert.triggeredInTransactionHash}
                    linkToExplorer={true}
                  />
                  <LabelAndValue label="Receipt ID" value={triggeredAlert.triggeredInReceiptId} linkToExplorer={true} />
                  <LabelAndValue
                    label="Block Hash"
                    value={triggeredAlert.triggeredInBlockHash}
                    linkToExplorer={true}
                    explorerPrefix={'blocks'}
                  />
                  {triggeredAlert.extraData && (
                    <>
                      <Text>Event Data</Text>
                      <Card css={{ background: 'var(--color-surface-1)' }}>
                        {JSON.stringify(triggeredAlert.extraData)}
                      </Card>
                    </>
                  )}
                </Flex>
              </Card>
            </Container>
          </Flex>
        )}
      </Flex>
    </Section>
  );
};

ViewTriggeredAlert.getLayout = wrapDashboardLayoutWithOptions({
  redirect: {
    environmentChange: true,
    projectChange: true,
    url: '/alerts',
  },
});

export default ViewTriggeredAlert;

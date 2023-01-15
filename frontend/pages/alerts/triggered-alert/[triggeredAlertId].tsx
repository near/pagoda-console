import type { Alerts, TriggeredAlerts } from '@pc/common/types/alerts';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Badge } from '@/components/lib/Badge';
import { ButtonLink } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { CodeBlock } from '@/components/lib/CodeBlock';
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
import { useSelectedProject, useSelectedProjectSync } from '@/hooks/selected-project';
import { useAlert } from '@/modules/alerts/hooks/alerts';
import { useTriggeredAlertDetails } from '@/modules/alerts/hooks/triggered-alerts';
import { alertTypes } from '@/modules/alerts/utils/constants';
import config from '@/utils/config';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

function LabelAndValue(props: {
  label: string;
  value: string;
  linkToExplorer?: string;
  explorerLinkStableId?: StableId;
  copyButtonStableId?: StableId;
}) {
  return (
    <Flex align="center" justify="start">
      <Text size="bodySmall" color="text1" css={{ minWidth: '10rem' }}>
        {props.label}
      </Text>
      <Flex align="center" justify="end" css={{ minWidth: 0 }}>
        {props.linkToExplorer ? (
          <>
            <TextLink
              stableId={props.explorerLinkStableId!}
              size="s"
              external
              href={props.linkToExplorer}
              css={{ minWidth: 0 }}
            >
              <TextOverflow>{props.value}</TextOverflow>
            </TextLink>
            <CopyButton stableId={props.copyButtonStableId!} value={props.value} />
          </>
        ) : (
          <Text color="text1" weight="semibold">
            {props.value}
          </Text>
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
  const { environment } = useSelectedProject();
  const baseExplorerUrl = environment && config.url.explorer[environment?.net];

  useSelectedProjectSync(alert?.environmentSubId, alert?.projectSlug);

  function alertType(triggeredAlert: TriggeredAlerts.TriggeredAlert) {
    if (!triggeredAlert) return alertTypes.EVENT;
    return alertTypes[triggeredAlert.type];
  }

  function alertContract(alert: Alerts.Alert) {
    return alert?.rule?.contract;
  }

  const triggeredAtDateFormatted = triggeredAlert
    ? DateTime.fromISO(new Date(triggeredAlert.triggeredAt).toISOString())?.toLocaleString(
        DateTime.DATETIME_SHORT_WITH_SECONDS,
      )
    : '';

  return (
    <Section>
      <Flex gap="l" stack={{ '@laptop': true }}>
        <Link href="/alerts?tab=activity" passHref>
          <TextLink stableId={StableId.TRIGGERED_ALERT_BACK_TO_ACTIVITY_LINK}>
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
                  <Flex stack>
                    <Flex>
                      <FeatherIcon icon="bell" size="m" />

                      <Flex stack gap="xs">
                        <Text color="text1">{triggeredAlert.name}</Text>
                        <Badge size="s">
                          <FeatherIcon icon={alertType(triggeredAlert).icon} size="xs" />
                          {alertType(triggeredAlert).name}
                        </Badge>
                        <Text size="bodySmall" color="text3">
                          {alertContract(alert)}{' '}
                        </Text>
                      </Flex>

                      <Link href={`/alerts/edit-alert/${alert.id}`} passHref>
                        <ButtonLink
                          stableId={StableId.TRIGGERED_ALERT_EDIT_LINK}
                          size="s"
                          aria-label="View alert configuration"
                        >
                          <FeatherIcon icon="settings" size="xs" />
                          Edit Alert
                        </ButtonLink>
                      </Link>
                    </Flex>
                  </Flex>

                  <HR />

                  <LabelAndValue label="Alert Triggered at" value={triggeredAtDateFormatted} />

                  {triggeredAlert.triggeredInTransactionHash ? (
                    <LabelAndValue
                      label="Transaction Hash"
                      value={triggeredAlert.triggeredInTransactionHash}
                      linkToExplorer={`${baseExplorerUrl}/transactions/${triggeredAlert.triggeredInTransactionHash}`}
                      copyButtonStableId={StableId.TRIGGERED_ALERT_COPY_TRANSACTION_HASH_BUTTON}
                      explorerLinkStableId={StableId.TRIGGERED_ALERT_TRANSACTION_HASH_LINK}
                    />
                  ) : null}

                  {triggeredAlert.triggeredInReceiptId ? (
                    <LabelAndValue
                      label="Receipt ID"
                      value={triggeredAlert.triggeredInReceiptId}
                      linkToExplorer={`${baseExplorerUrl}/transactions/${triggeredAlert.triggeredInTransactionHash}#${triggeredAlert.triggeredInReceiptId}`}
                      copyButtonStableId={StableId.TRIGGERED_ALERT_COPY_RECEIPT_ID_BUTTON}
                      explorerLinkStableId={StableId.TRIGGERED_ALERT_RECEIPT_ID_LINK}
                    />
                  ) : null}

                  <LabelAndValue
                    label="Block Hash"
                    value={triggeredAlert.triggeredInBlockHash}
                    linkToExplorer={`${baseExplorerUrl}/blocks/${triggeredAlert.triggeredInBlockHash}`}
                    copyButtonStableId={StableId.TRIGGERED_ALERT_COPY_BLOCK_HASH_BUTTON}
                    explorerLinkStableId={StableId.TRIGGERED_ALERT_BLOCK_HASH_LINK}
                  />

                  <LabelAndValue label="Triggered Alert ID" value={triggeredAlert.slug} />
                  {triggeredAlert.extraData && (
                    <>
                      <HR />
                      <Text size="bodySmall" color="text1">
                        Event Data
                      </Text>
                      <CodeBlock language="json">{JSON.stringify(triggeredAlert.extraData, null, 2)}</CodeBlock>
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

import type { TriggeredAlerts } from '@pc/common/types/alerts';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

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
import { withSelectedProject } from '@/components/with-selected-project';
import { wrapDashboardLayoutWithOptions } from '@/hooks/layouts';
import { useSureProjectContext } from '@/hooks/project-context';
import { useQuery } from '@/hooks/query';
import { alertTypes } from '@/modules/alerts/utils/constants';
import config from '@/utils/config';
import { mapEnvironmentSubIdToNet } from '@/utils/helpers';
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
  const { environmentSubId, updateContext: updateProjectContext } = useSureProjectContext();
  const triggeredAlertId = router.query.triggeredAlertId as TriggeredAlerts.TriggeredAlertSlug;
  const triggeredAlertQuery = useQuery(['/triggeredAlerts/getTriggeredAlertDetails', { slug: triggeredAlertId }]);
  const alertQuery = useQuery(['/alerts/getAlertDetails', { id: triggeredAlertQuery.data?.alertId ?? -1 }], {
    enabled: triggeredAlertQuery.status === 'success',
  });
  const baseExplorerUrl = config.url.explorer[mapEnvironmentSubIdToNet(environmentSubId)];

  useEffect(() => {
    if (!alertQuery.data) {
      return;
    }
    updateProjectContext(alertQuery.data.projectSlug, alertQuery.data.environmentSubId);
  }, [alertQuery.data, updateProjectContext]);

  const triggeredAtDateFormatted =
    triggeredAlertQuery.status === 'success'
      ? DateTime.fromISO(triggeredAlertQuery.data.triggeredAt)?.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
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

        {triggeredAlertQuery.status === 'loading' || alertQuery.status === 'loading' ? <Spinner center /> : null}

        {triggeredAlertQuery.status === 'error' && (
          <Container size="m">
            <Card>
              <Flex stack align="center">
                <FeatherIcon icon="bell-off" size="l" />
                <Text>{`No Triggered Alert with this ID was found.`}</Text>
              </Flex>
            </Card>
          </Container>
        )}

        {triggeredAlertQuery.status === 'success' && alertQuery.status === 'success' && (
          <Flex align="start">
            <Container size="m">
              <Card>
                <Flex stack>
                  <Flex stack>
                    <Flex>
                      <FeatherIcon icon="bell" size="m" />

                      <Flex stack gap="xs">
                        <Text color="text1">{triggeredAlertQuery.data.name}</Text>
                        <Badge size="s">
                          <FeatherIcon icon={alertTypes[triggeredAlertQuery.data.type].icon} size="xs" />
                          {alertTypes[triggeredAlertQuery.data.type].name}
                        </Badge>
                        <Text size="bodySmall" color="text3">
                          {alertQuery.data.rule.contract}
                        </Text>
                      </Flex>

                      <Link href={`/alerts/edit-alert/${alertQuery.data.id}`} passHref>
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

                  {triggeredAlertQuery.data.triggeredInTransactionHash ? (
                    <LabelAndValue
                      label="Transaction Hash"
                      value={triggeredAlertQuery.data.triggeredInTransactionHash}
                      linkToExplorer={`${baseExplorerUrl}/transactions/${triggeredAlertQuery.data.triggeredInTransactionHash}`}
                      copyButtonStableId={StableId.TRIGGERED_ALERT_COPY_TRANSACTION_HASH_BUTTON}
                      explorerLinkStableId={StableId.TRIGGERED_ALERT_TRANSACTION_HASH_LINK}
                    />
                  ) : null}

                  {triggeredAlertQuery.data.triggeredInReceiptId ? (
                    <LabelAndValue
                      label="Receipt ID"
                      value={triggeredAlertQuery.data.triggeredInReceiptId}
                      linkToExplorer={`${baseExplorerUrl}/transactions/${triggeredAlertQuery.data.triggeredInTransactionHash}#${triggeredAlertQuery.data.triggeredInReceiptId}`}
                      copyButtonStableId={StableId.TRIGGERED_ALERT_COPY_RECEIPT_ID_BUTTON}
                      explorerLinkStableId={StableId.TRIGGERED_ALERT_RECEIPT_ID_LINK}
                    />
                  ) : null}

                  <LabelAndValue
                    label="Block Hash"
                    value={triggeredAlertQuery.data.triggeredInBlockHash}
                    linkToExplorer={`${baseExplorerUrl}/blocks/${triggeredAlertQuery.data.triggeredInBlockHash}`}
                    copyButtonStableId={StableId.TRIGGERED_ALERT_COPY_BLOCK_HASH_BUTTON}
                    explorerLinkStableId={StableId.TRIGGERED_ALERT_BLOCK_HASH_LINK}
                  />

                  <LabelAndValue label="Triggered Alert ID" value={triggeredAlertQuery.data.slug} />
                  {triggeredAlertQuery.data.extraData && (
                    <>
                      <HR />
                      <Text size="bodySmall" color="text1">
                        Event Data
                      </Text>
                      <CodeBlock language="json">
                        {JSON.stringify(triggeredAlertQuery.data.extraData, null, 2)}
                      </CodeBlock>
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

export default withSelectedProject(ViewTriggeredAlert);

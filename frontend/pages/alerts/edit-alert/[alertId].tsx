import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Box } from '@/components/lib/Box';
import { Button, ButtonLink } from '@/components/lib/Button';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H1, H2, H3, H4 } from '@/components/lib/Heading';
import { HR } from '@/components/lib/HorizontalRule';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { openToast } from '@/components/lib/Toast';
import { ErrorModal } from '@/components/modals/ErrorModal';
import { useContracts } from '@/hooks/contracts';
import { useDashboardLayout } from '@/hooks/layouts';
import { useSelectedProject } from '@/hooks/selected-project';
import { useAlert } from '@/modules/alerts/hooks/alerts';
import { alertTypes, amountComparators } from '@/modules/alerts/utils/constants';
import type { AcctBalRule, Alert, AlertType, EventRule, FnCallRule, TxRule } from '@/modules/alerts/utils/types';
import analytics from '@/utils/analytics';
import { authenticatedPost } from '@/utils/http';
import type { NextPageWithLayout } from '@/utils/types';

interface FormData {
  something: string;
}

const EditAlert: NextPageWithLayout = () => {
  const router = useRouter();
  const alertId = parseInt(router.query.alertId as string);
  const { register, handleSubmit, formState, control } = useForm<FormData>();
  const { alert } = useAlert(alertId);
  const [updateError, setUpdateError] = useState('');

  async function updateAlert(data: FormData) {
    console.log(data);
  }

  return (
    <Section>
      <Flex gap="l" stack={{ '@laptop': true }}>
        <Flex
          stack
          css={{
            width: '100%',
            maxWidth: 'var(--size-max-container-width-xs)',
            '@laptop': {
              maxWidth: '100%',
            },
          }}
        >
          <Flex align="center">
            <FeatherIcon icon="bell" size="m" />
            <H3 as="h1">Edit Alert</H3>
          </Flex>

          <Text>To preserve alert history integrity, most fields can&apos;t be edited after an alert is created.</Text>

          <Link href="/alerts" passHref>
            <TextLink>
              <Flex align="center" gap="s" as="span">
                <FeatherIcon icon="arrow-left" />
                Alerts
              </Flex>
            </TextLink>
          </Link>
        </Flex>

        {!alert ? (
          <Spinner center />
        ) : (
          <Form.Root disabled={formState.isSubmitting} onSubmit={handleSubmit(updateAlert)}>
            <Flex stack gap="l">
              <Flex stack>
                <H4>Target</H4>

                <Text>{alert.contract.address}</Text>
              </Flex>

              <HR />

              <Flex stack>
                <H4>Condition</H4>

                <Text>{alertTypes[alert.type].name}</Text>

                {(alert.type === 'ACCT_BAL_NUM' || alert.type === 'ACCT_BAL_PCT') && (
                  <>
                    <Text>Comp: {alert.acctBalRule?.comparator}</Text>
                    <Text>Amount: {alert.acctBalRule?.amount}</Text>
                  </>
                )}

                {alert.type === 'EVENT' && (
                  <>
                    <Text>Event Name: {alert.eventRule?.event}</Text>
                    <Text>Standard: {alert.eventRule?.standard}</Text>
                    <Text>Version: {alert.eventRule?.version}</Text>
                  </>
                )}

                {alert.type === 'FN_CALL' && (
                  <>
                    <Text>Function Name: {alert.fnCallRule?.function}</Text>
                  </>
                )}
              </Flex>

              <HR />

              <Flex stack>
                <H4>Destination</H4>

                <Text>TODO</Text>
              </Flex>

              <HR />

              <Flex justify="spaceBetween" align="center">
                <H4>Delete</H4>

                <Button color="danger">Delete Alert</Button>
              </Flex>

              <HR />

              <Flex justify="spaceBetween" align="center">
                <Button type="submit" loading={formState.isSubmitting}>
                  <FeatherIcon icon="bell" /> Update Alert
                </Button>

                <Link href="/alerts" passHref>
                  <TextLink color="neutral">Cancel</TextLink>
                </Link>
              </Flex>
            </Flex>
          </Form.Root>
        )}
      </Flex>

      <ErrorModal error={updateError} setError={setUpdateError} />
    </Section>
  );
};

EditAlert.getLayout = useDashboardLayout;

export default EditAlert;

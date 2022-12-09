import { DateTime } from 'luxon';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

import { ContractTemplateDetails } from '@/components/contract-templates/ContractTemplateDetails';
import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Section } from '@/components/lib/Section';
import { TextLink } from '@/components/lib/TextLink';
import { openToast } from '@/components/lib/Toast';
import { useAuth } from '@/hooks/auth';
import type { ContractTemplate } from '@/hooks/contract-templates';
import { useContractTemplate } from '@/hooks/contract-templates';
import { useSimpleLogoutLayout } from '@/hooks/layouts';
import { useMutation } from '@/hooks/mutation';
import { useRawMutation } from '@/hooks/raw-mutation';
import { useRouteParam } from '@/hooks/route';
import analytics from '@/utils/analytics';
import { deployContractTemplate } from '@/utils/deploy-contract-template';
import { mapEnvironmentSubIdToNet } from '@/utils/helpers';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const ViewProjectTemplate: NextPageWithLayout = () => {
  const router = useRouter();
  const slug = useRouteParam('templateSlug');
  const template = useContractTemplate(slug);
  const { authStatus } = useAuth();

  const onError = useCallback(
    () =>
      openToast({
        type: 'error',
        title: 'Failed to create example project.',
      }),
    [],
  );
  const addContractMutation = useMutation('/projects/addContract', {
    onSuccess: (_, { project, environment }) => router.push(`/contracts?project=${project}&environment=${environment}`),
    onError,
  });
  const createProjectMutation = useMutation('/projects/create', {
    onSuccess: async (project) => {
      const { environmentSubId, address } = await deployContractTemplate(template!);
      addContractMutation.mutate({ project: project.slug, environment: environmentSubId, address });
    },
    onError,
    getAnalyticsSuccessData: ({ name }) => ({ name, slug: template?.slug }),
    getAnalyticsErrorData: ({ name }) => ({ name, slug: template?.slug }),
  });

  const deployContractMutation = useRawMutation<
    Awaited<ReturnType<typeof deployContractTemplate>>,
    unknown,
    ContractTemplate
  >(deployContractTemplate, {
    onSuccess: async (deployResult, template) => {
      const date = DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);
      const projectName = `${template.title}, ${date}`;
      if (authStatus === 'AUTHENTICATED') {
        createProjectMutation.mutate({ name: projectName });
      } else {
        router.push(
          `/public/contracts?addresses=${deployResult.address}&net=${mapEnvironmentSubIdToNet(
            deployResult.environmentSubId,
          )}`,
        );
      }
    },
    onError: (error, template) => {
      analytics.track('DC Create New Example Project', {
        status: 'failure',
        slug: template.slug,
        error: (error as any).message,
      });
      onError();
    },
  });

  if (!template) return null;

  const isLoading = createProjectMutation.isLoading || addContractMutation.isLoading;

  return (
    <Section>
      <Container size="s">
        <Flex stack gap="l">
          <Link href={authStatus === 'AUTHENTICATED' ? '/pick-project-template' : '/'} passHref>
            <TextLink stableId={StableId.PROJECT_TEMPLATE_BACK_TO_TEMPLATES_LINK}>
              <FeatherIcon icon="arrow-left" /> Example Projects
            </TextLink>
          </Link>

          <ContractTemplateDetails
            template={template}
            onSelect={deployContractMutation.mutate}
            isDeploying={isLoading}
          />
        </Flex>
      </Container>
    </Section>
  );
};

ViewProjectTemplate.getLayout = useSimpleLogoutLayout;

export default ViewProjectTemplate;

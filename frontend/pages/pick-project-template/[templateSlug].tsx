import { useMutation } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { ContractTemplateDetails } from '@/components/contract-templates/ContractTemplateDetails';
import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Section } from '@/components/lib/Section';
import { TextLink } from '@/components/lib/TextLink';
import { useApiMutation } from '@/hooks/api-mutation';
import { useAuth } from '@/hooks/auth';
import { useContractTemplate } from '@/hooks/contract-templates';
import { useSimpleLogoutLayout } from '@/hooks/layouts';
import { useRouteParam } from '@/hooks/route';
import analytics from '@/utils/analytics';
import { deployContractTemplate } from '@/utils/deploy-contract-template';
import { handleMutationError } from '@/utils/error-handlers';
import { mapEnvironmentSubIdToNet } from '@/utils/helpers';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const ViewProjectTemplate: NextPageWithLayout = () => {
  const router = useRouter();
  const slug = useRouteParam('templateSlug');
  const template = useContractTemplate(slug);
  const { authStatus } = useAuth();

  const onError = (error: unknown) => {
    handleMutationError({
      error,
      eventLabel: 'DC Create New Example Project',
      eventData: {
        slug: template?.slug,
      },
      toastTitle: 'Failed to create example project.',
    });
  };

  const addContractMutation = useApiMutation('/projects/addContract', {
    onSuccess: (result, { project, environment }) => {
      router.push(`/contracts?project=${project}&environment=${environment}`);
    },
    onError,
  });

  const createProjectMutation = useApiMutation('/projects/create', {
    onSuccess: async (project) => {
      const { environmentSubId, address } = await deployContractTemplate(template!);

      addContractMutation.mutate({ project: project.slug, environment: environmentSubId, address });

      analytics.track('DC Create New Example Project', {
        status: 'success',
        name: project.name,
        slug: template?.slug,
      });
    },
    onError,
  });

  const deployContractMutation = useMutation(deployContractTemplate, {
    onSuccess: async (deployResult, template) => {
      const date = DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);
      const projectName = `${template.title}, ${date}`;
      if (authStatus === 'AUTHENTICATED') {
        createProjectMutation.mutate({ name: projectName });
      } else {
        analytics.track('DC Create New Example Project (Guest)', {
          status: 'success',
          slug: template?.slug,
        });

        router.push(
          `/public/contracts?addresses=${deployResult.address}&net=${mapEnvironmentSubIdToNet(
            deployResult.environmentSubId,
          )}`,
        );
      }
    },
    onError,
  });

  if (!template) return null;

  const isLoading =
    deployContractMutation.isLoading || createProjectMutation.isLoading || addContractMutation.isLoading;

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

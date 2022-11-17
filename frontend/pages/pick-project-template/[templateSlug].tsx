import type { Projects } from '@pc/common/types/core';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';

import { ContractTemplateDetails } from '@/components/contract-templates/ContractTemplateDetails';
import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { TextLink } from '@/components/lib/TextLink';
import { openToast } from '@/components/lib/Toast';
import { SignInModal } from '@/components/modals/SignInModal';
import { useContractTemplate } from '@/hooks/contract-templates';
import { useSimpleLogoutLayout } from '@/hooks/layouts';
import { useMutation } from '@/hooks/mutation';
import { useQuery } from '@/hooks/query';
import { useRouteParam } from '@/hooks/route';
import { deployContractTemplate } from '@/utils/deploy-contract-template';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const ViewProjectTemplate: NextPageWithLayout = () => {
  const router = useRouter();
  const slug = useRouteParam('templateSlug') as Projects.ContractSlug;
  const template = useContractTemplate(slug);
  const userQuery = useQuery(['/users/getAccountDetails']);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const createProjectMutation = useMutation('/projects/create', {
    onSuccess: (project) => router.push(`/contracts?project=${project.slug}&environment=1`),
    onError: () =>
      openToast({
        type: 'error',
        title: 'Failed to create example project.',
      }),
    getAnalyticsSuccessData: ({ name }) => ({ name, slug: template?.slug }),
    getAnalyticsErrorData: ({ name }) => ({ name, slug: template?.slug }),
  });

  const createProject = useCallback(() => {
    if (!template) return;

    if (!userQuery.data) {
      setShowSignInModal(true);
      sessionStorage.setItem('signInRedirectUrl', router.asPath);
      return;
    }

    const date = DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);
    const projectName = `${template.title}, ${date}`;
    createProjectMutation.mutate({ name: projectName }, { onSuccess: () => deployContractTemplate(template) });
  }, [template, userQuery.data, createProjectMutation, router.asPath]);

  if (!template) return null;

  return (
    <Container size="s">
      <Flex stack gap="l">
        <Link href={userQuery.data ? '/pick-project-template' : '/'} passHref>
          <TextLink stableId={StableId.PROJECT_TEMPLATE_BACK_TO_TEMPLATES_LINK}>
            <FeatherIcon icon="arrow-left" /> Example Projects
          </TextLink>
        </Link>

        <ContractTemplateDetails
          template={template}
          onSelect={createProject}
          isDeploying={createProjectMutation.isLoading}
        />
      </Flex>

      <SignInModal
        description="You’ll need to sign in or create an account in order to deploy and explore your contract."
        show={showSignInModal}
        setShow={setShowSignInModal}
      />
    </Container>
  );
};

ViewProjectTemplate.getLayout = useSimpleLogoutLayout;

export default ViewProjectTemplate;

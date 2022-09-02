import { DateTime } from 'luxon';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { ContractTemplateDetails } from '@/components/contract-templates/ContractTemplateDetails';
import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { TextLink } from '@/components/lib/TextLink';
import { openToast } from '@/components/lib/Toast';
import { SignInModal } from '@/components/modals/SignInModal';
import { useContractTemplate } from '@/hooks/contract-templates';
import { useSimpleLogoutLayout } from '@/hooks/layouts';
import { useRouteParam } from '@/hooks/route';
import { useAccount } from '@/hooks/user';
import analytics from '@/utils/analytics';
import { deployContractTemplate } from '@/utils/deploy-contract-template';
import { authenticatedPost } from '@/utils/http';
import type { Project } from '@/utils/types';
import type { NextPageWithLayout } from '@/utils/types';

const ViewProjectTemplate: NextPageWithLayout = () => {
  const router = useRouter();
  const slug = useRouteParam('templateSlug');
  const template = useContractTemplate(slug);
  const { user } = useAccount();
  const [isDeploying, setIsDeploying] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);

  async function createProject() {
    if (!template) return;

    if (!user) {
      setShowSignInModal(true);
      sessionStorage.setItem('signInRedirectUrl', router.asPath);
      return;
    }

    const date = DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);
    const projectName = `${template.title}, ${date}`;

    try {
      setIsDeploying(true);

      const project = await authenticatedPost<Project>('/projects/create', {
        name: projectName,
      });

      await deployContractTemplate(project, template);

      analytics.track('DC Create New Example Project', {
        status: 'success',
        name: projectName,
        slug: template.slug,
      });

      await router.push(`/contracts?project=${project.slug}&environment=1`);
    } catch (e: any) {
      setIsDeploying(false);

      analytics.track('DC Create New Example Project', {
        status: 'failure',
        slug: template.slug,
        error: e.message,
      });

      console.log(e);

      openToast({
        type: 'error',
        title: 'Failed to create example project.',
      });
    }
  }

  if (!template) return null;

  return (
    <Container size="s">
      <Flex stack gap="l">
        <Link href={user ? '/pick-project-template' : '/'} passHref>
          <TextLink>
            <FeatherIcon icon="arrow-left" /> Back
          </TextLink>
        </Link>

        <ContractTemplateDetails template={template} onSelect={createProject} isDeploying={isDeploying} />
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

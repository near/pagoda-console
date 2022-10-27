import { DateTime } from 'luxon';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { ContractTemplateDetails } from '@/components/contract-templates/ContractTemplateDetails';
import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Section } from '@/components/lib/Section';
import { TextLink } from '@/components/lib/TextLink';
import { openToast } from '@/components/lib/Toast';
import { useAuth } from '@/hooks/auth';
import { useContractTemplate } from '@/hooks/contract-templates';
import { useSimpleLogoutLayout } from '@/hooks/layouts';
import { useRouteParam } from '@/hooks/route';
import analytics from '@/utils/analytics';
import { deployContractTemplate } from '@/utils/deploy-contract-template';
import { authenticatedPost } from '@/utils/http';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const ViewProjectTemplate: NextPageWithLayout = () => {
  const router = useRouter();
  const slug = useRouteParam('templateSlug');
  const template = useContractTemplate(slug);
  const { authStatus } = useAuth();
  const [isDeploying, setIsDeploying] = useState(false);

  async function createProject() {
    if (!template) return;

    const date = DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);
    const projectName = `${template.title}, ${date}`;

    try {
      setIsDeploying(true);

      const deployResult = await deployContractTemplate(template);

      if (authStatus === 'AUTHENTICATED') {
        const project = await authenticatedPost('/projects/create', {
          name: projectName,
        });

        await authenticatedPost('/projects/addContract', {
          project: project.slug,
          environment: deployResult.subId,
          address: deployResult.address,
        });

        analytics.track('DC Create New Example Project', {
          status: 'success',
          name: projectName,
          slug: template.slug,
        });

        await router.push(`/contracts?project=${project.slug}&environment=1`);
      } else {
        analytics.track('DC Create New Example Project (Guest)', {
          status: 'success',
          slug: template.slug,
        });

        await router.push(`/public/contracts?addresses=${deployResult.address}&net=TESTNET`);
      }
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
    <Section>
      <Container size="s">
        <Flex stack gap="l">
          <Link href={authStatus === 'AUTHENTICATED' ? '/pick-project-template' : '/'} passHref>
            <TextLink stableId={StableId.PROJECT_TEMPLATE_BACK_TO_TEMPLATES_LINK}>
              <FeatherIcon icon="arrow-left" /> Example Projects
            </TextLink>
          </Link>

          <ContractTemplateDetails template={template} onSelect={createProject} isDeploying={isDeploying} />
        </Flex>
      </Container>
    </Section>
  );
};

ViewProjectTemplate.getLayout = useSimpleLogoutLayout;

export default ViewProjectTemplate;

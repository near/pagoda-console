import ProjectSelector from '@/components/ProjectSelector';
import components from '@/components/tutorials/components';
import NextStepButton from '@/components/tutorials/NextStepButton';
import TableOfContents from '@/components/tutorials/TableOfContents';
import TutorialFooter from '@/components/tutorials/TutorialFooter';
import Content from '@/tutorials/nfts/md/8-marketplace.mdx';
import { dashboardLayout } from '@/utils/layouts';
import type { NextPageWithLayout } from '@/utils/types';

const Marketplace: NextPageWithLayout = () => {
  return (
    <>
      <ProjectSelector />
      <TableOfContents />
      <Content components={components} />
      <TutorialFooter>
        <NextStepButton path="/project-analytics" label="Complete Tutorial" />
      </TutorialFooter>
    </>
  );
};

Marketplace.getLayout = dashboardLayout;

export default Marketplace;

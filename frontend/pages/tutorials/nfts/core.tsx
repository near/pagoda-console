import ProjectSelector from '@/components/ProjectSelector';
import components from '@/components/tutorials/components';
import NextStepButton from '@/components/tutorials/NextStepButton';
import TableOfContents from '@/components/tutorials/TableOfContents';
import TutorialFooter from '@/components/tutorials/TutorialFooter';
import Content from '@/tutorials/nfts/md/4-core.mdx';
import { dashboardLayout } from '@/utils/layouts';
import type { NextPageWithLayout } from '@/utils/types';

const Core: NextPageWithLayout = () => {
  return (
    <>
      <ProjectSelector />
      <TableOfContents />
      <Content components={components} />
      <TutorialFooter>
        <NextStepButton path="/tutorials/nfts/approvals" label="Step 7: Approvals" />
      </TutorialFooter>
    </>
  );
};

Core.getLayout = dashboardLayout;

export default Core;

import ProjectSelector from '@/components/ProjectSelector';
import components from '@/components/tutorials/components';
import NextStepButton from '@/components/tutorials/NextStepButton';
import TableOfContents from '@/components/tutorials/TableOfContents';
import TutorialFooter from '@/components/tutorials/TutorialFooter';
import Content from '@/tutorials/nfts/md/5-approval.mdx';
import { useDashboardLayout } from '@/utils/layouts';
import type { NextPageWithLayout } from '@/utils/types';

const Approvals: NextPageWithLayout = () => {
  return (
    <>
      <ProjectSelector />
      <TableOfContents />
      <Content components={components} />
      <TutorialFooter>
        <NextStepButton path="/tutorials/nfts/royalty" label="Step 8: Royalty" />
      </TutorialFooter>
    </>
  );
};

Approvals.getLayout = useDashboardLayout;

export default Approvals;

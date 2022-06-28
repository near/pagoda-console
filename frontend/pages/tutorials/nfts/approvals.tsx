import { useDashboardLayout } from '@/hooks/layouts';
import components from '@/modules/core/components/tutorials/components';
import NextStepButton from '@/modules/core/components/tutorials/NextStepButton';
import TableOfContents from '@/modules/core/components/tutorials/TableOfContents';
import TutorialFooter from '@/modules/core/components/tutorials/TutorialFooter';
import { TutorialPage } from '@/modules/core/components/tutorials/TutorialPage';
import Content from '@/tutorials/nfts/md/5-approval.mdx';
import type { NextPageWithLayout } from '@/utils/types';

const Approvals: NextPageWithLayout = () => {
  return (
    <TutorialPage sidebar={<TableOfContents />}>
      <Content components={components} />
      <TutorialFooter>
        <NextStepButton path="/tutorials/nfts/royalty" label="Step 8: Royalty" />
      </TutorialFooter>
    </TutorialPage>
  );
};

Approvals.getLayout = useDashboardLayout;

export default Approvals;

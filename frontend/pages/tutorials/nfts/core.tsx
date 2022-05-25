import components from '@/components/tutorials/components';
import NextStepButton from '@/components/tutorials/NextStepButton';
import TableOfContents from '@/components/tutorials/TableOfContents';
import TutorialFooter from '@/components/tutorials/TutorialFooter';
import { useDashboardLayout } from '@/hooks/layouts';
import Content from '@/tutorials/nfts/md/4-core.mdx';
import type { NextPageWithLayout } from '@/utils/types';

const Core: NextPageWithLayout = () => {
  return (
    <>
      <TableOfContents />
      <Content components={components} />
      <TutorialFooter>
        <NextStepButton path="/tutorials/nfts/approvals" label="Step 7: Approvals" />
      </TutorialFooter>
    </>
  );
};

Core.getLayout = useDashboardLayout;

export default Core;

import ProjectSelector from '@/components/ProjectSelector';
import components from '@/components/tutorials/components';
import NextStepButton from '@/components/tutorials/NextStepButton';
import TableOfContents from '@/components/tutorials/TableOfContents';
import TutorialFooter from '@/components/tutorials/TutorialFooter';
import { useDashboardLayout } from '@/hooks/layouts';
import Content from '@/tutorials/nfts/md/0-predeployed.mdx';
import type { NextPageWithLayout } from '@/utils/types';

const PredeployedContract: NextPageWithLayout = () => {
  return (
    <>
      <ProjectSelector />
      <TableOfContents />
      <Content components={components} />
      <TutorialFooter>
        <NextStepButton path="/tutorials/nfts/skeleton" label="Step 2: Contract Architecture" />
      </TutorialFooter>
    </>
  );
};

PredeployedContract.getLayout = useDashboardLayout;

export default PredeployedContract;

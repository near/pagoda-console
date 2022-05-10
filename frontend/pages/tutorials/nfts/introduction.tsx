import ProjectSelector from '@/components/ProjectSelector';
import components from '@/components/tutorials/components';
import NextStepButton from '@/components/tutorials/NextStepButton';
import TableOfContents from '@/components/tutorials/TableOfContents';
import TutorialFooter from '@/components/tutorials/TutorialFooter';
import { useDashboardLayout } from '@/hooks/layouts';
import Content from '@/tutorials/nfts/md/0-intro.mdx';
import type { NextPageWithLayout } from '@/utils/types';

const Introduction: NextPageWithLayout = () => {
  return (
    <>
      <ProjectSelector />
      <TableOfContents />
      <Content components={components} />
      <TutorialFooter>
        <NextStepButton path="/tutorials/nfts/predeployed-contract" label="Step 1: Pre-deployed Contract" />
      </TutorialFooter>
    </>
  );
};

Introduction.getLayout = useDashboardLayout;

export default Introduction;

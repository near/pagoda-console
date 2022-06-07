import components from '@/components/tutorials/components';
import NextStepButton from '@/components/tutorials/NextStepButton';
import TableOfContents from '@/components/tutorials/TableOfContents';
import TutorialFooter from '@/components/tutorials/TutorialFooter';
import { TutorialPage } from '@/components/tutorials/TutorialPage';
import { useDashboardLayout } from '@/hooks/layouts';
import Content from '@/tutorials/nfts/md/0-intro.mdx';
import type { NextPageWithLayout } from '@/utils/types';

const Introduction: NextPageWithLayout = () => {
  return (
    <>
      <TutorialPage sidebar={<TableOfContents />}>
        <Content components={components} />
        <TutorialFooter>
          <NextStepButton path="/tutorials/nfts/predeployed-contract" label="Step 1: Pre-deployed Contract" />
        </TutorialFooter>
      </TutorialPage>
    </>
  );
};

Introduction.getLayout = useDashboardLayout;

export default Introduction;

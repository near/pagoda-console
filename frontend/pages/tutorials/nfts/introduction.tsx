import { useDashboardLayout } from '@/hooks/layouts';
import components from '@/modules/core/components/tutorials/components';
import NextStepButton from '@/modules/core/components/tutorials/NextStepButton';
import TableOfContents from '@/modules/core/components/tutorials/TableOfContents';
import TutorialFooter from '@/modules/core/components/tutorials/TutorialFooter';
import { TutorialPage } from '@/modules/core/components/tutorials/TutorialPage';
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

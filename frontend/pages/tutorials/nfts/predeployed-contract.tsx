import components from '@/components/tutorials/components';
import NextStepButton from '@/components/tutorials/NextStepButton';
import TableOfContents from '@/components/tutorials/TableOfContents';
import TutorialFooter from '@/components/tutorials/TutorialFooter';
import { TutorialPage } from '@/components/tutorials/TutorialPage';
import { useDashboardLayout } from '@/hooks/layouts';
import Content from '@/tutorials/nfts/md/0-predeployed.mdx';
import type { NextPageWithLayout } from '@/utils/types';

const PredeployedContract: NextPageWithLayout = () => {
  return (
    <>
      <TutorialPage sidebar={<TableOfContents />}>
        <Content components={components} />
        <TutorialFooter>
          <NextStepButton path="/tutorials/nfts/skeleton" label="Step 2: Contract Architecture" />
        </TutorialFooter>
      </TutorialPage>
    </>
  );
};

PredeployedContract.getLayout = useDashboardLayout;

export default PredeployedContract;

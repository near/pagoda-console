import components from '@/components/tutorials/components';
import NextStepButton from '@/components/tutorials/NextStepButton';
import TableOfContents from '@/components/tutorials/TableOfContents';
import TutorialFooter from '@/components/tutorials/TutorialFooter';
import { TutorialPage } from '@/components/tutorials/TutorialPage';
import { useDashboardLayout } from '@/hooks/layouts';
import Content from '@/tutorials/nfts/md/1-skeleton.mdx';
import type { NextPageWithLayout } from '@/utils/types';

const Skeleton: NextPageWithLayout = () => {
  return (
    <>
      <TutorialPage sidebar={<TableOfContents />}>
        <Content components={components} />
        <TutorialFooter>
          <NextStepButton path="/tutorials/nfts/minting" label="Step 3: Minting" />
        </TutorialFooter>
      </TutorialPage>
    </>
  );
};

Skeleton.getLayout = useDashboardLayout;

export default Skeleton;

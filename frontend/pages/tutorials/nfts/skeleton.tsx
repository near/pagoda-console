import { useDashboardLayout } from '@/hooks/layouts';
import components from '@/modules/core/components/tutorials/components';
import NextStepButton from '@/modules/core/components/tutorials/NextStepButton';
import TableOfContents from '@/modules/core/components/tutorials/TableOfContents';
import TutorialFooter from '@/modules/core/components/tutorials/TutorialFooter';
import { TutorialPage } from '@/modules/core/components/tutorials/TutorialPage';
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

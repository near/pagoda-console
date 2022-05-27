import components from '@/components/tutorials/components';
import NextStepButton from '@/components/tutorials/NextStepButton';
import TableOfContents from '@/components/tutorials/TableOfContents';
import TutorialFooter from '@/components/tutorials/TutorialFooter';
import { TutorialPage } from '@/components/tutorials/TutorialPage';
import { useDashboardLayout } from '@/hooks/layouts';
import Content from '@/tutorials/nfts/md/2-minting.mdx';
import type { NextPageWithLayout } from '@/utils/types';

const Minting: NextPageWithLayout = () => {
  return (
    <>
      <TutorialPage sidebar={<TableOfContents />}>
        <Content components={components} />
        <TutorialFooter>
          <NextStepButton path="/tutorials/nfts/upgrade-contract" label="Step 4: Upgrade a Contract" />
        </TutorialFooter>
      </TutorialPage>
    </>
  );
};

Minting.getLayout = useDashboardLayout;

export default Minting;

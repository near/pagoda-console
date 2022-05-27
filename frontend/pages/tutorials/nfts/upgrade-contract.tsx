import components from '@/components/tutorials/components';
import NextStepButton from '@/components/tutorials/NextStepButton';
import TableOfContents from '@/components/tutorials/TableOfContents';
import TutorialFooter from '@/components/tutorials/TutorialFooter';
import { TutorialPage } from '@/components/tutorials/TutorialPage';
import { useDashboardLayout } from '@/hooks/layouts';
import Content from '@/tutorials/nfts/md/2-upgrade.mdx';
import type { NextPageWithLayout } from '@/utils/types';

const UpgradeContract: NextPageWithLayout = () => {
  return (
    <>
      <TutorialPage sidebar={<TableOfContents />}>
        <Content components={components} />
        <TutorialFooter>
          <NextStepButton path="/tutorials/nfts/enumeration" label="Step 5: Enumeration" />
        </TutorialFooter>
      </TutorialPage>
    </>
  );
};

UpgradeContract.getLayout = useDashboardLayout;

export default UpgradeContract;

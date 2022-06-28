import { useDashboardLayout } from '@/hooks/layouts';
import components from '@/modules/core/components/tutorials/components';
import NextStepButton from '@/modules/core/components/tutorials/NextStepButton';
import TableOfContents from '@/modules/core/components/tutorials/TableOfContents';
import TutorialFooter from '@/modules/core/components/tutorials/TutorialFooter';
import { TutorialPage } from '@/modules/core/components/tutorials/TutorialPage';
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

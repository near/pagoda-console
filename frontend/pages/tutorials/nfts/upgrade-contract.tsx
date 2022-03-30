import ProjectSelector from '@/components/ProjectSelector';
import components from '@/components/tutorials/components';
import NextStepButton from '@/components/tutorials/NextStepButton';
import TableOfContents from '@/components/tutorials/TableOfContents';
import TutorialFooter from '@/components/tutorials/TutorialFooter';
import Content from '@/tutorials/nfts/md/2-upgrade.mdx';
import { useDashboardLayout } from '@/utils/layouts';
import type { NextPageWithLayout } from '@/utils/types';

const UpgradeContract: NextPageWithLayout = () => {
  return (
    <>
      <ProjectSelector />
      <TableOfContents />
      <Content components={components} />
      <TutorialFooter>
        <NextStepButton path="/tutorials/nfts/enumeration" label="Step 5: Enumeration" />
      </TutorialFooter>
    </>
  );
};

UpgradeContract.getLayout = useDashboardLayout;

export default UpgradeContract;

import ProjectSelector from '@/components/ProjectSelector';
import components from '@/components/tutorials/components';
import NextStepButton from '@/components/tutorials/NextStepButton';
import TableOfContents from '@/components/tutorials/TableOfContents';
import TutorialFooter from '@/components/tutorials/TutorialFooter';
import Content from '@/tutorials/nfts/md/2-minting.mdx';
import { dashboardLayout } from '@/utils/layouts';
import type { NextPageWithLayout } from '@/utils/types';

const Minting: NextPageWithLayout = () => {
  return (
    <>
      <ProjectSelector />
      <TableOfContents />
      <Content components={components} />
      <TutorialFooter>
        <NextStepButton path="/tutorials/nfts/upgrade-contract" label="Step 4: Upgrade a Contract" />
      </TutorialFooter>
    </>
  );
};

Minting.getLayout = dashboardLayout;

export default Minting;

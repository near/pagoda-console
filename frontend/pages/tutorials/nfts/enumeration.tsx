import ProjectSelector from '@/components/ProjectSelector';
import components from '@/components/tutorials/components';
import NextStepButton from '@/components/tutorials/NextStepButton';
import TableOfContents from '@/components/tutorials/TableOfContents';
import TutorialFooter from '@/components/tutorials/TutorialFooter';
import { useDashboardLayout } from '@/hooks/layouts';
import Content from '@/tutorials/nfts/md/3-enumeration.mdx';
import type { NextPageWithLayout } from '@/utils/types';

const Enumeration: NextPageWithLayout = () => {
  return (
    <>
      <ProjectSelector />
      <TableOfContents />
      <Content components={components} />
      <TutorialFooter>
        <NextStepButton path="/tutorials/nfts/core" label="Step 6: Core" />
      </TutorialFooter>
    </>
  );
};

Enumeration.getLayout = useDashboardLayout;

export default Enumeration;

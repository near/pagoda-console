import components from '@/components/tutorials/components';
import NextStepButton from '@/components/tutorials/NextStepButton';
import TableOfContents from '@/components/tutorials/TableOfContents';
import TutorialFooter from '@/components/tutorials/TutorialFooter';
import { TutorialPage } from '@/components/tutorials/TutorialPage';
import { useDashboardLayout } from '@/hooks/layouts';
import Content from '@/tutorials/nfts/md/3-enumeration.mdx';
import type { NextPageWithLayout } from '@/utils/types';

const Enumeration: NextPageWithLayout = () => {
  return (
    <>
      <TutorialPage sidebar={<TableOfContents />}>
        <Content components={components} />
        <TutorialFooter>
          <NextStepButton path="/tutorials/nfts/core" label="Step 6: Core" />
        </TutorialFooter>
      </TutorialPage>
    </>
  );
};

Enumeration.getLayout = useDashboardLayout;

export default Enumeration;

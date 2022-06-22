import { useDashboardLayout } from '@/hooks/layouts';
import components from '@/modules/core/components/tutorials/components';
import NextStepButton from '@/modules/core/components/tutorials/NextStepButton';
import TableOfContents from '@/modules/core/components/tutorials/TableOfContents';
import TutorialFooter from '@/modules/core/components/tutorials/TutorialFooter';
import { TutorialPage } from '@/modules/core/components/tutorials/TutorialPage';
import Content from '@/tutorials/nfts/md/6-royalty.mdx';
import type { NextPageWithLayout } from '@/utils/types';

const Royalty: NextPageWithLayout = () => {
  return (
    <>
      <TutorialPage sidebar={<TableOfContents />}>
        <Content components={components} />
        <TutorialFooter>
          <NextStepButton path="/tutorials/nfts/events" label="Step 9: Events" />
        </TutorialFooter>
      </TutorialPage>
    </>
  );
};

Royalty.getLayout = useDashboardLayout;

export default Royalty;

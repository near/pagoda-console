import components from '@/components/tutorials/components';
import NextStepButton from '@/components/tutorials/NextStepButton';
import TableOfContents from '@/components/tutorials/TableOfContents';
import TutorialFooter from '@/components/tutorials/TutorialFooter';
import { TutorialPage } from '@/components/tutorials/TutorialPage';
import { useDashboardLayout } from '@/hooks/layouts';
import Content from '@/tutorials/nfts/md/7-events.mdx';
import type { NextPageWithLayout } from '@/utils/types';

const Events: NextPageWithLayout = () => {
  return (
    <>
      <TutorialPage sidebar={<TableOfContents />}>
        <Content components={components} />
        <TutorialFooter>
          <NextStepButton path="/tutorials/nfts/marketplace" label="Step 10: Marketplace" />
        </TutorialFooter>
      </TutorialPage>
    </>
  );
};

Events.getLayout = useDashboardLayout;

export default Events;

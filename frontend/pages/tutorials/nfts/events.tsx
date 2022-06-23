import { useDashboardLayout } from '@/hooks/layouts';
import components from '@/modules/core/components/tutorials/components';
import NextStepButton from '@/modules/core/components/tutorials/NextStepButton';
import TableOfContents from '@/modules/core/components/tutorials/TableOfContents';
import TutorialFooter from '@/modules/core/components/tutorials/TutorialFooter';
import { TutorialPage } from '@/modules/core/components/tutorials/TutorialPage';
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

import ProjectSelector from '../../../components/ProjectSelector';
import components from '../../../components/tutorials/components';
import NextStepButton from '../../../components/tutorials/NextStepButton';
import TableOfContents from '../../../components/tutorials/TableOfContents';
import TutorialFooter from '../../../components/tutorials/TutorialFooter';
import Content from '../../../tutorials/nfts/md/7-events.mdx';
import { useDashboardLayout } from '../../../utils/layouts';
import type { NextPageWithLayout } from '../../../utils/types';

const Events: NextPageWithLayout = () => {
  return (
    <>
      <ProjectSelector />
      <TableOfContents />
      <Content components={components} />
      <TutorialFooter>
        <NextStepButton path="/tutorials/nfts/marketplace" label="Step 10: Marketplace" />
      </TutorialFooter>
    </>
  );
};

Events.getLayout = useDashboardLayout;

export default Events;

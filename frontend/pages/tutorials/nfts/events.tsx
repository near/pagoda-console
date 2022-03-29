import { NextPageWithLayout } from '../../../utils/types';
import ProjectSelector from '../../../components/ProjectSelector';
import components from '../../../components/tutorials/components';
import NextStepButton from '../../../components/tutorials/NextStepButton';
import TableOfContents from '../../../components/tutorials/TableOfContents';
import TutorialFooter from '../../../components/tutorials/TutorialFooter';
import { useDashboardLayout } from '../../../utils/layouts';
import Content from '../../../tutorials/nfts/md/7-events.mdx';

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

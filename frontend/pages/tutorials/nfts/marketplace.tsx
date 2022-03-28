import { NextPageWithLayout } from '../../../utils/types';
import ProjectSelector from '../../../components/ProjectSelector';
import components from '../../../components/tutorials/components';
import TableOfContents from '../../../components/tutorials/TableOfContents';
import { useDashboardLayout } from '../../../utils/layouts';
import Content from '../../../tutorials/nfts/md/8-marketplace.mdx';
import TutorialFooter from '../../../components/tutorials/TutorialFooter';
import NextStepButton from '../../../components/tutorials/NextStepButton';

const Marketplace: NextPageWithLayout = () => {
  return (
    <>
      <ProjectSelector />
      <TableOfContents />
      <Content components={components} />
      <TutorialFooter>
        <NextStepButton path="/project-analytics" label="Complete Tutorial" />
      </TutorialFooter>
    </>
  );
};

Marketplace.getLayout = useDashboardLayout;

export default Marketplace;

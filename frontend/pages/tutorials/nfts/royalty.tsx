import ProjectSelector from '../../../components/ProjectSelector';
import components from '../../../components/tutorials/components';
import NextStepButton from '../../../components/tutorials/NextStepButton';
import TableOfContents from '../../../components/tutorials/TableOfContents';
import TutorialFooter from '../../../components/tutorials/TutorialFooter';
import Content from '../../../tutorials/nfts/md/6-royalty.mdx';
import { useDashboardLayout } from '../../../utils/layouts';
import { NextPageWithLayout } from '../../../utils/types';

const Royalty: NextPageWithLayout = () => {
  return (
    <>
      <ProjectSelector />
      <TableOfContents />
      <Content components={components} />
      <TutorialFooter>
        <NextStepButton path="/tutorials/nfts/events" label="Step 9: Events" />
      </TutorialFooter>
    </>
  );
};

Royalty.getLayout = useDashboardLayout;

export default Royalty;

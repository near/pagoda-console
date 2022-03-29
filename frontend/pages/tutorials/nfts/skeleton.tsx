import ProjectSelector from '../../../components/ProjectSelector';
import components from '../../../components/tutorials/components';
import NextStepButton from '../../../components/tutorials/NextStepButton';
import TableOfContents from '../../../components/tutorials/TableOfContents';
import TutorialFooter from '../../../components/tutorials/TutorialFooter';
import Content from '../../../tutorials/nfts/md/1-skeleton.mdx';
import { useDashboardLayout } from '../../../utils/layouts';
import { NextPageWithLayout } from '../../../utils/types';

const Skeleton: NextPageWithLayout = () => {
  return (
    <>
      <ProjectSelector />
      <TableOfContents />
      <Content components={components} />
      <TutorialFooter>
        <NextStepButton path="/tutorials/nfts/minting" label="Step 3: Minting" />
      </TutorialFooter>
    </>
  );
};

Skeleton.getLayout = useDashboardLayout;

export default Skeleton;

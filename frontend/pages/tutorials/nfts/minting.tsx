import ProjectSelector from '../../../components/ProjectSelector';
import components from '../../../components/tutorials/components';
import NextStepButton from '../../../components/tutorials/NextStepButton';
import TableOfContents from '../../../components/tutorials/TableOfContents';
import TutorialFooter from '../../../components/tutorials/TutorialFooter';
import { useDashboardLayout } from '../../../utils/layouts';
import Content from '../../../tutorials/nfts/md/2-minting.mdx';

export default function Overview() {
  return (
    <>
      <ProjectSelector />
      <TableOfContents />
      <Content components={components} />
      <TutorialFooter>
        <NextStepButton path="/tutorials/nfts/upgrade-contract" label="Step 4: Upgrade a Contract" />
      </TutorialFooter>
    </>
  );
}

Overview.getLayout = useDashboardLayout;

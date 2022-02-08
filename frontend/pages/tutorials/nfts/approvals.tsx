import ProjectSelector from "../../../components/ProjectSelector";
import components from "../../../components/tutorials/components";
import NextStepButton from "../../../components/tutorials/NextStepButton";
import TableOfContents from "../../../components/tutorials/TableOfContents";
import TutorialFooter from "../../../components/tutorials/TutorialFooter";
import { useDashboardLayout } from "../../../utils/layouts";
import Content from './md/5-approval.mdx';

export default function Overview() {
    return <>
        <ProjectSelector />
        <TableOfContents />
        <Content components={components} />
        <TutorialFooter><NextStepButton path="/tutorials/nfts/royalty" label="Step 8: Royalty" /></TutorialFooter>
    </>;
}

Overview.getLayout = useDashboardLayout;
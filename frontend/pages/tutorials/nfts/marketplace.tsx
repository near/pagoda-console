import ProjectSelector from "../../../components/ProjectSelector";
import components from "../../../components/tutorials/components";
import TableOfContents from "../../../components/tutorials/TableOfContents";
import { useDashboardLayout } from "../../../utils/layouts";
import Content from '../../../tutorials/nfts/md/8-marketplace.mdx';
import TutorialFooter from "../../../components/tutorials/TutorialFooter";
import NextStepButton from "../../../components/tutorials/NextStepButton";

export default function Overview() {
    return <>
        <ProjectSelector />
        <TableOfContents />
        <Content components={components} />
        <TutorialFooter><NextStepButton path="/analytics" label="Complete Tutorial" /></TutorialFooter>
    </>;
}

Overview.getLayout = useDashboardLayout;
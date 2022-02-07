import ProjectSelector from "../../../components/ProjectSelector";
import components from "../../../components/tutorials/components";
import NextStepButton from "../../../components/tutorials/NextStepButton";
import TutorialFooter from "../../../components/tutorials/TutorialFooter";
import { useDashboardLayout } from "../../../utils/layouts";
import Content from './md/6-royalty.mdx';

export default function Overview() {
    return <>
        <ProjectSelector />
        <Content components={components} />
        <TutorialFooter><NextStepButton path="/tutorials/nfts/events" label="Events" /></TutorialFooter>
    </>;
}

Overview.getLayout = useDashboardLayout;
import ProjectSelector from "../../../components/ProjectSelector";
import components from "../../../components/tutorials/components";
import NextStepButton from "../../../components/tutorials/NextStepButton";
import TutorialFooter from "../../../components/tutorials/TutorialFooter";
import { useDashboardLayout } from "../../../utils/layouts";
import Content from './md/2-upgrade.mdx';

export default function Overview() {
    return <>
        <ProjectSelector />
        <Content components={components} />
        <TutorialFooter><NextStepButton path="/tutorials/nfts/enumeration" label="Step 5: Enumeration" /></TutorialFooter>
    </>;
}

Overview.getLayout = useDashboardLayout;
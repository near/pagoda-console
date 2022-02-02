import ProjectSelector from "../../../components/ProjectSelector";
import components from "../../../components/tutorials/components";
import NextStepButton from "../../../components/tutorials/NextStepButton";
import TutorialFooter from "../../../components/tutorials/TutorialFooter";
import { useDashboardLayout } from "../../../utils/layouts";
import Content from './overview.mdx';

export default function Overview() {
    // You can map markdown syntax to a JSX component: https://mdxjs.com/table-of-components/
    return <>
        <ProjectSelector />
        <Content components={components} />
        <TutorialFooter><NextStepButton path="/tutorials/nfts/pre-deployed-contract" label="Step 1: Pre-deployed Contract" /></TutorialFooter>
    </>;
}

Overview.getLayout = useDashboardLayout;
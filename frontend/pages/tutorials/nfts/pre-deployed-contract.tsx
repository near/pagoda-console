import ProjectSelector from "../../../components/ProjectSelector";
import { useDashboardLayout } from "../../../utils/layouts";
import Content from './pre-deployed-contract.mdx';

export default function Overview() {
    return <>
        <ProjectSelector />
        <Content></Content>
    </>;
}

Overview.getLayout = useDashboardLayout;
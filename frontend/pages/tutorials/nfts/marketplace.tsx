import ProjectSelector from "../../../components/ProjectSelector";
import components from "../../../components/tutorials/components";
import { useDashboardLayout } from "../../../utils/layouts";
import Content from './md/8-marketplace.mdx';

export default function Overview() {
    return <>
        <ProjectSelector />
        <Content components={components} />
    </>;
}

Overview.getLayout = useDashboardLayout;
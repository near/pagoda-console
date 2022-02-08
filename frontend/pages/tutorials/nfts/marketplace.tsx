import ProjectSelector from "../../../components/ProjectSelector";
import components from "../../../components/tutorials/components";
import TableOfContents from "../../../components/tutorials/TableOfContents";
import { useDashboardLayout } from "../../../utils/layouts";
import Content from './md/8-marketplace.mdx';

export default function Overview() {
    return <>
        <ProjectSelector />
        <TableOfContents />
        <Content components={components} />
    </>;
}

Overview.getLayout = useDashboardLayout;
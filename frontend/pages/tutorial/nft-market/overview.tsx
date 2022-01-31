import { useDashboardLayout } from "../../../utils/layouts";
import Content from './overview.mdx';

export default function Overview() {
    return <>
        <Content></Content>
    </>;
}

Overview.getLayout = useDashboardLayout;
import ProjectSelector from "../../../components/ProjectSelector";
import NextStepButton from "../../../components/tutorials/NextStepButton";
import { useDashboardLayout } from "../../../utils/layouts";
import Content from './overview.mdx';

export default function Overview() {
    return <>
        <ProjectSelector />
        <Content></Content>
        <div className="footerContainer"><NextStepButton path="/tutorials/nfts/pre-deployed-contract" label="Step-1: Pre-deployed Contract" /></div>
        <style jsx>{`
            .footerContainer {
                margin-top: 1.25rem;
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
                align-items: center;
            }
        `}</style>
    </>;
}

Overview.getLayout = useDashboardLayout;
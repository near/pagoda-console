import ProjectSelector from "../components/ProjectSelector";
import StarterGuide from "../components/StarterGuide";
import { useDashboardLayout } from "../utils/layouts";

export default function RPC() {
    return (
        <div className="pageContainer">
            <ProjectSelector />
            <StarterGuide />
            <style jsx>{`
              .pageContainer {
                    display: flex;
                    flex-direction: column;
                }
            `}</style>
        </div>
    );
}

RPC.getLayout = useDashboardLayout;
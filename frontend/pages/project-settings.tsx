import { useProject } from "../utils/fetchers";
import { useRouteParam } from "../utils/hooks";
import { useDashboardLayout } from "../utils/layouts";

export default function ProjectSettings() {
    const projectSlug = useRouteParam('project', '/projects');
    const { project, error } = useProject(projectSlug);

    return (
        <div className='pageContainer'>
            <div className='titleContainer'>
                <h1>{project?.name || 'Loading...'}</h1>
            </div>
            <h2>Project Settings</h2>

            <h3>API Keys</h3>
            Coming soon!
            <style jsx>{`
                .pageContainer {
                display: flex;
                flex-direction: column;
                }
                .titleContainer {
                margin-bottom: 2.75rem;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                }
                h3 {
                    margin-top: 2rem;
                }
            `}</style>
        </div>
    );
}

ProjectSettings.getLayout = useDashboardLayout;
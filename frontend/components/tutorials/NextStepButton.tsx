import { useRouter } from "next/router";
import { Button } from "react-bootstrap";
import { useRouteParam } from "../../utils/hooks";

export default function NextStepButton({ label, path }: { label: string, path: string }) {
    const router = useRouter();
    const project = useRouteParam('project');
    const environment = useRouteParam('environment');

    return <Button onClick={() => router.push(`${path}?project=${project}&environment=${environment}`)} variant='primary'>{label}</Button>;
}
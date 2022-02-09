import Link from "next/link";
import { Button } from "react-bootstrap";
import { useRouteParam } from "../../utils/hooks";

export default function NextStepButton({ label, path }: { label: string, path: string }) {
    const project = useRouteParam('project');
    const environment = useRouteParam('environment');

    return <Link passHref href={`${path}?project=${project}&environment=${environment}`}>
        <Button as="a" variant='primary'>{label}</Button>
    </Link>;
}
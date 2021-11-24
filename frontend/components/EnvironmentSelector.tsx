// TODO convert to HOC and pass down rendering of dropdown

import { Dispatch, SetStateAction } from 'react';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import { useEnvironments } from '../utils/fetchers';
import { Environment } from "../utils/interfaces";

export default function EnvironmentSelector({ project, environment, setEnvironment }: { project: string | null, environment?: Environment, setEnvironment: Dispatch<SetStateAction<Environment | undefined>> }) {
    const { environmentData: environments, error } = useEnvironments(project);
    if (!environment && environments) {
        setEnvironment(environments[0]);
    }

    return (
        <>
            {environment && environments && <DropdownButton
                variant="outline-secondary"
                title={environment.name}
                onSelect={(eventKey) => {
                    setEnvironment(environments.find((env) => eventKey === env.name));
                }}
            >
                {environments.map((env) => (
                    <Dropdown.Item key={env.subId} eventKey={env.name}>
                        {env.name}
                    </Dropdown.Item>
                ))}
            </DropdownButton>}
        </>
    );
}
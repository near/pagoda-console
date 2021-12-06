// TODO convert to HOC and pass down rendering of dropdown

import { useRouter } from 'next/router';
import { forwardRef } from 'react';
import { Dropdown, ButtonProps, Button } from 'react-bootstrap';
import { useProjectAndEnvironment } from '../utils/hooks';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'

export default function EnvironmentSelector() {
    const router = useRouter();
    const { project, environment, environments } = useProjectAndEnvironment();

    function changeEnvironment(eventKey: string | null) {
        if (!environments || !project) {
            return;
        }
        const newEnv = environments.find((env) => eventKey === env.name);
        if (newEnv) {
            router.replace(`${router.pathname}?project=${project.slug}&environment=${newEnv.subId}`, undefined, { shallow: true });
        }

    }

    return (
        <>
            {environment && environments && (
                <Dropdown onSelect={changeEnvironment}>
                    <Dropdown.Toggle as={CustomToggle}>{environment.name}</Dropdown.Toggle>
                    <Dropdown.Menu>
                        {environments.map((env) => (
                            <Dropdown.Item key={env.subId} eventKey={env.name}>
                                <span className='coloredIndicator'>●</span>{env.name}
                                <style jsx>{`
                            .coloredIndicator {
                                color: ${getIndicatorColor(env.name)};
                                margin-right: 0.25rem;
                            }
                            `}</style>
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            )}
        </>
    );
}

// The forwardRef is important!!
// Dropdown needs access to the DOM node in order to position the Menu
const CustomToggle = forwardRef<HTMLButtonElement, ButtonProps>(({ children, onClick }, ref) => (
    <div className='customToggle'>
        <Button
            variant='outline-secondary'
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick && onClick(e);
            }}
        >
            <div className='buttonContainer'>
                <span className='coloredIndicator'>●</span>
                {children}
                <FontAwesomeIcon icon={faCaretDown} />
            </div>
        </Button>
        <style jsx>{`
        .customToggle :global(svg) {
                margin-left: 3rem;
            }
        `}</style>
        <style jsx>{`
        .coloredIndicator {
            color: ${typeof children === 'string' && getIndicatorColor(children)};
            margin-right: 0.25rem;
        }
        .buttonContainer {
            display: flex;
            flex-direction: row;
            align-items: center;
        }
        `}</style>
    </div>
));
CustomToggle.displayName = 'CustomToggle';

function getIndicatorColor(net: string) {
    return net === 'Mainnet' ? '#00BF89' : '#e9b870'
}
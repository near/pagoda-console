import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { forwardRef } from 'react';
import type { ButtonProps } from 'react-bootstrap';
import { Button, Dropdown } from 'react-bootstrap';

import { useSelectedProject } from '@/hooks/selected-project';
import analytics from '@/utils/analytics';

export default function EnvironmentSelector() {
  const { environment, environments, selectEnvironment } = useSelectedProject();

  function onSelectEnvironment(eventKey: string | null) {
    if (!environments) return;

    const selection = environments.find((env) => eventKey === env.name);

    if (selection) {
      selectEnvironment(selection.subId);
      analytics.track('DC Switch Network', {
        status: 'success',
        net: selection.net,
      });
    }
  }

  return (
    <>
      {environment && environments && (
        <Dropdown onSelect={onSelectEnvironment}>
          <Dropdown.Toggle as={CustomToggle}>{environment.name}</Dropdown.Toggle>
          <Dropdown.Menu>
            {environments.map((env) => (
              <Dropdown.Item key={env.subId} eventKey={env.name}>
                <span className="coloredIndicator">●</span>
                {env.name}
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

// From react-bootstrap docs:
// > The forwardRef is important!!
// > Dropdown needs access to the DOM node in order to position the Menu
const CustomToggle = forwardRef<HTMLButtonElement, ButtonProps>(({ children, onClick }, ref) => (
  <div className="customToggle">
    <Button
      variant="outline-secondary"
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick && onClick(e);
      }}
    >
      <div className="buttonContainer">
        <span className="coloredIndicator">●</span>
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
  return net === 'Mainnet' ? '#00BF89' : '#e9b870';
}

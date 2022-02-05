import { faExclamationCircle, faInfoCircle, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert } from "react-bootstrap";

export default function Note(props: any) {
    let icon;
    if (props.type === 'info') {
        icon = faExclamationCircle;
    } else if (props.type === 'tip') {
        icon = faLightbulb;
    } else {
        icon = faInfoCircle;
    }

    return <>
        <Alert>
            <p><span className="iconWrapper"><FontAwesomeIcon icon={icon} /></span>{props.children[0] ? props.children[0].props.children : props.children.props.children}</p>
            {props.children[0] && props.children.slice(1)}
        </Alert>
        <style jsx>{`
            .iconWrapper {
                margin-right: .5rem;
            }
            :global(*):last-child {
                margin-bottom: 0;
            }
        `}</style>
    </>;
}
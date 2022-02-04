import { Alert } from "react-bootstrap";

export default function Note(props: any) {
    return <>
        <Alert>{props.children}</Alert>
        <style jsx>{`
            :global(*):last-child {
                margin-bottom: 0;
            }
        `}</style>
    </>;
}
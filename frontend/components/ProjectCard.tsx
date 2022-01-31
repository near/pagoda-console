import { faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card } from "react-bootstrap";

export default function ProjectCard(props: { path?: string, image: string, title: string, onClick: () => void }) {
    const opacity = props.path ? 1 : .5;
    const cursor = props.path ? 'pointer' : 'auto';

    return <>
        <div style={{ cursor }}>
            <Card style={{ opacity, minWidth: '18rem', borderRadius: '6rem', backgroundColor: '#C4C4C4', borderColor: 'none' }} onClick={() => props.onClick()}>
                <Card.Img style={{ padding: '1rem' }} variant="top" src={props.image} />
                <Card.Body>
                    <Card.Title style={{ textAlign: 'center', fontSize: '2rem' }}><b>{props.title}  </b><FontAwesomeIcon icon={faAngleDoubleRight} /></Card.Title>
                </Card.Body>
            </Card>
        </div>
    </>;
}
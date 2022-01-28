import { faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { Card } from "react-bootstrap";

export default function ProjectCard(props: { path: string, image: string, title: string }) {
    const router = useRouter();

    return <>
        <div className="projectCardWrapper">
            <Card style={{ borderRadius: '6rem', backgroundColor: '#C4C4C4', borderColor: 'none' }} onClick={() => router.push(props.path)}>
                <Card.Img style={{ padding: '1rem' }} variant="top" src={props.image} />
                <Card.Body>
                    <Card.Title style={{ textAlign: 'center', fontSize: '2rem' }}><b>{props.title}  </b><FontAwesomeIcon icon={faAngleDoubleRight} /></Card.Title>
                </Card.Body>
            </Card>
        </div>
        <style jsx>{`
            .projectCardWrapper {
                cursor: pointer;
            }
        `}</style>
    </>;
}
import { Modal, Button } from 'react-bootstrap';

export default function CenterModal(props: { title: string, content: string, onConfirm?: () => void, confirmText?: string, onHide: () => void, show: boolean }) {
    return (
        <Modal
            show={props.show}
            onHide={props.onHide}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {props.title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{props.content}</p>
            </Modal.Body>
            {props.onConfirm &&
                <Modal.Footer>
                    <Button onClick={props.onHide} variant='secondary'>Cancel</Button>
                    <Button onClick={props.onConfirm} variant='danger'>{props.confirmText}</Button>
                </Modal.Footer>
            }
        </Modal>
    );
}
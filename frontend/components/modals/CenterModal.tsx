import { Alert, Button, Modal } from 'react-bootstrap';

export default function CenterModal(props: {
  title: string;
  content: string;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  confirmText?: string;
  onHide: () => void;
  show: boolean;
  errorText?: string | undefined;
}) {
  return (
    <Modal show={props.show} onHide={props.onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{props.content}</p>
      </Modal.Body>
      {props.onConfirm && (
        <>
          <Modal.Footer>
            <Button onClick={props.onHide} variant="secondary">
              Cancel
            </Button>
            <Button disabled={props.confirmDisabled} onClick={props.onConfirm} variant="danger">
              {props.confirmText}
            </Button>
          </Modal.Footer>
          {props.errorText && (
            <>
              <div className="alertContainer">
                <Alert variant="danger">{props.errorText}</Alert>
              </div>
              <style jsx>{`
                .alertContainer {
                  padding: 0 1rem 0 1rem;
                }
              `}</style>
            </>
          )}
        </>
      )}
    </Modal>
  );
}

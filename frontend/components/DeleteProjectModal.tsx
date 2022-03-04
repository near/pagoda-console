import CenterModal from "./CenterModal";

export default function DeleteProjectModal({ name, show, setShow, onConfirm }: { name: string, show: boolean, setShow: (show: boolean) => void, onConfirm: () => void }) {
    const warning = 'Removing this project may have unintended consequences, make sure the API keys for this project are no longer in use before removing it.';
    return (
        <CenterModal show={show} title={`Remove ${name}`} content={warning} onConfirm={onConfirm} confirmText='Remove' onHide={() => setShow(false)} />
    );
}
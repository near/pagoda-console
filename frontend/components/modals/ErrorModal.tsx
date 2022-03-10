import CenterModal from "./CenterModal";

export default function ErrorModal({ error, setError }: { error: string, setError: (err: string) => void }) {
    return (
        <CenterModal title='Error' show={!!error} onHide={() => setError('')} content={error} />
    );
}
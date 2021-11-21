import { Alert, Button } from 'react-bootstrap';
import BorderSpinner from '../components/BorderSpinner';
import { useAccount } from '../utils/fetchers';
import { useDashboardLayout } from "../utils/layouts";

export default function Settings() {
    const { user, error } = useAccount();

    const isLoading = !user && !error;
    // TODO handle error
    return (
        <div className='pageContainer'>
            <div className='titleContainer'>
                <h1>User Settings</h1>
                <Button>Edit</Button>
                {error && <Alert variant='danger'>Something went wrong</Alert>}
            </div>
            <div className='settingsContainer'>
                <div className='settingRow'>
                    <span className='settingLabel'>Display Name</span>
                    <span className='settingValue'>{isLoading ? <BorderSpinner /> : (user && user.name)}</span>
                </div>
                <div className='settingRow'>
                    <span className='settingLabel'>Email Address</span>
                    <span className='settingValue'>{isLoading ? <BorderSpinner /> : (user && user.email)}</span>
                </div>
            </div>
            <style jsx>{`
            .pageContainer {
                display: flex;
                flex-direction: column;
            }
            .titleContainer {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2.75rem;
            }
            .settingsContainer {
                display: flex;
                flex-direction: column;
                row-gap: 1rem;
            }
            .settingRow {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
            }
            .settingLabel {
                font-weight: 600;
            }
        `}</style>
        </div>
    );
}

Settings.getLayout = useDashboardLayout;
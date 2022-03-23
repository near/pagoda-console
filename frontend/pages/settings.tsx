import { FormEvent, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import BorderSpinner from '../components/BorderSpinner';
import ErrorModal from '../components/modals/ErrorModal';
import { authenticatedPost, useAccount } from '../utils/fetchers';
import { useDashboardLayout } from '../utils/layouts';
import { getAuth, getIdToken, updateProfile } from 'firebase/auth';
import { useIdentity } from '../utils/hooks';

export default function Settings() {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [updateInProgress, setUpdateInProgress] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>('');
  const { user, error, mutate } = useAccount();
  const identity = useIdentity();
  const [updateError, setUpdateError] = useState<string>('');

  async function toggleEditMode(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (isEditing) {
      if (identity && displayName && displayName !== user?.name) {
        //an update was made
        try {
          setUpdateInProgress(true);
          await updateProfile(identity, {
            displayName,
          });

          // force token refresh since that is where the backend gets user details
          await getIdToken(identity, true);

          mutate({
            ...user,
            name: displayName,
          });
        } catch (e) {
          setUpdateError('Something went wrong while attempting to update display name');
        } finally {
          setUpdateInProgress(false);
        }
      }
      setIsEditing(false);
    } else {
      setDisplayName(user!.name!);
      setIsEditing(true);
    }
  }

  const isLoading = !user && !error;
  // TODO handle error
  return (
    <div className="pageContainer">
      <ErrorModal error={updateError} setError={setUpdateError} />
      <div className="titleContainer">
        <h1>User Settings</h1>
        <Button onClick={toggleEditMode} disabled={!user?.name || updateInProgress}>
          {!isEditing ? 'Edit' : 'Done'}
        </Button>
      </div>
      {error && <Alert variant="danger">Could not fetch account data</Alert>}
      <div className="settingsContainer">
        <div className="settingRow">
          <span className="settingLabel">Display Name</span>
          {!isEditing && <span className="settingValue">{isLoading ? <BorderSpinner /> : user && user.name}</span>}
          {isEditing && (
            <Form onSubmit={toggleEditMode}>
              <Form.Control
                value={displayName}
                disabled={updateInProgress}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </Form>
          )}
        </div>
        <div className="settingRow">
          <span className="settingLabel">Email Address</span>
          <span className="settingValue">{isLoading ? <BorderSpinner /> : user && user.email}</span>
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
          height: 2.5rem;
          align-items: center;
        }
        .settingLabel {
          font-weight: 600;
        }
        .settingsContainer :global(input) {
          width: 20rem;
        }
      `}</style>
    </div>
  );
}

Settings.getLayout = useDashboardLayout;

import { FormEvent, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import BorderSpinner from '../components/BorderSpinner';
import ErrorModal from '../components/modals/ErrorModal';
import { useAccount } from '../utils/fetchers';
import { useDashboardLayout } from '../utils/layouts';
import { getIdToken, updateProfile } from 'firebase/auth';
import { useIdentity } from '../utils/hooks';

interface ValidationFailure {
  displayName?: string;
}

export default function Settings() {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [updateInProgress, setUpdateInProgress] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>('');
  const { user, error, mutate } = useAccount();
  const identity = useIdentity();
  const [updateError, setUpdateError] = useState<string>('');
  const [validationFail, setValidationFail] = useState<ValidationFailure>({});

  function handleFormChange(type: 'displayName', newValue: string): void {
    setValidationFail({});

    switch (type) {
      case 'displayName':
        setDisplayName(newValue);
        break;

      default:
        const _exhaustiveCheck: never = type;
        break;
    }
  }

  async function submitForm() {
    if (!identity) return;
    if (!validate()) return;

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
      setIsEditing(false);
    }
  }

  async function toggleEditMode(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (isEditing) {
      await submitForm();
    } else {
      setDisplayName(user!.name!);
      setIsEditing(true);
    }
  }

  function validate() {
    const validations: ValidationFailure = {};
    let failed = false;

    if (!displayName) {
      validations.displayName = 'Please enter a display name';
      failed = true;
    } else if (displayName.length > 50) {
      validations.displayName = 'Display name must be 50 characters or less';
      failed = true;
    }

    setValidationFail(validations);
    return !failed;
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

      <Form noValidate onSubmit={toggleEditMode}>
        <div className="settingsContainer">
          <div className="settingRow">
            <span className="settingLabel">Display Name</span>
            {!isEditing && <span className="settingValue">{isLoading ? <BorderSpinner /> : user && user.name}</span>}
            {isEditing && (
              <Form.Group controlId="formBasicDisplayName">
                <Form.Control
                  value={displayName}
                  onChange={(e) => handleFormChange('displayName', e.target.value)}
                  isInvalid={!!validationFail.displayName}
                  placeholder="John Nearian"
                />
                <Form.Control.Feedback type="invalid">{validationFail.displayName}</Form.Control.Feedback>
              </Form.Group>
            )}
          </div>

          <div className="settingRow">
            <span className="settingLabel">Email Address</span>
            <span className="settingValue">{isLoading ? <BorderSpinner /> : user && user.email}</span>
          </div>
        </div>
      </Form>

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

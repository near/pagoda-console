import { getIdToken, updateProfile } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import BorderSpinner from '@/components/BorderSpinner';
import { ErrorModal } from '@/components/modals/ErrorModal';
import { useDashboardLayout } from '@/hooks/layouts';
import { useAccount, useIdentity } from '@/hooks/user';
import { formValidations } from '@/utils/constants';
import type { NextPageWithLayout } from '@/utils/types';

interface SettingsFormData {
  displayName: string;
}

const Settings: NextPageWithLayout = () => {
  const { register, handleSubmit, formState, setValue } = useForm<SettingsFormData>();
  const [isEditing, setIsEditing] = useState(false);
  const { user, error, mutate } = useAccount();
  const identity = useIdentity();
  const [updateError, setUpdateError] = useState('');

  function edit() {
    setValue('displayName', user!.name!);
    setIsEditing(true);
  }

  const submitSettings: SubmitHandler<SettingsFormData> = async ({ displayName }) => {
    if (!identity) return;

    try {
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
      setUpdateError('Something went wrong while attempting to update your settings');
    } finally {
      setIsEditing(false);
    }
  };

  const isLoading = !user && !error;
  // TODO handle error
  return (
    <div className="pageContainer">
      <ErrorModal error={updateError} setError={setUpdateError} />

      <Form noValidate onSubmit={handleSubmit(submitSettings)}>
        <fieldset disabled={formState.isSubmitting}>
          <div className="titleContainer">
            <h1>User Settings</h1>
            {isEditing && <Button type="submit">Done</Button>}
            {!isEditing && <Button onClick={edit}>Edit</Button>}
          </div>

          {error && <Alert variant="danger">Could not fetch account data</Alert>}

          <div className="settingsContainer">
            <div className="settingRow">
              <span className="settingLabel">Display Name</span>
              {!isEditing && <span className="settingValue">{isLoading ? <BorderSpinner /> : user && user.name}</span>}
              {isEditing && (
                <Form.Group controlId="formBasicDisplayName">
                  <Form.Control
                    isInvalid={!!formState.errors.displayName}
                    placeholder="John Nearian"
                    {...register('displayName', formValidations.displayName)}
                  />
                  <Form.Control.Feedback type="invalid">{formState.errors.displayName?.message}</Form.Control.Feedback>
                </Form.Group>
              )}
            </div>

            <div className="settingRow">
              <span className="settingLabel">Email Address</span>
              <span className="settingValue">{isLoading ? <BorderSpinner /> : user && user.email}</span>
            </div>
          </div>
        </fieldset>
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
          min-height: 2.5rem;
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
};

Settings.getLayout = useDashboardLayout;

export default Settings;

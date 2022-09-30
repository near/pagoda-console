import { useQueryClient } from '@tanstack/react-query';
import { getIdToken, updateProfile } from 'firebase/auth';
import { useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H1, H4 } from '@/components/lib/Heading';
import { HR } from '@/components/lib/HorizontalRule';
import { Message } from '@/components/lib/Message';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import { openToast } from '@/components/lib/Toast';
import { ErrorModal } from '@/components/modals/ErrorModal';
import { useDashboardLayout } from '@/hooks/layouts';
import { useAccount, useIdentity } from '@/hooks/user';
import DeleteAccountModal from '@/modules/core/components/modals/DeleteAccountModal';
import { logOut } from '@/utils/auth';
import { formValidations } from '@/utils/constants';
import { authQueryKey } from '@/utils/http';
import type { NextPageWithLayout } from '@/utils/types';

interface SettingsFormData {
  displayName: string;
}

const Settings: NextPageWithLayout = () => {
  const { register, handleSubmit, formState, setValue } = useForm<SettingsFormData>();
  const [isEditing, setIsEditing] = useState(false);
  const { data: user, error } = useAccount();
  const identity = useIdentity();
  const [updateError, setUpdateError] = useState('');
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const queryClient = useQueryClient();

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

      // add displayName to account details locally
      queryClient.setQueryData(authQueryKey(['user', 'details']), { ...user, name: displayName });
    } catch (e) {
      setUpdateError('Something went wrong while attempting to update your settings');
    } finally {
      setIsEditing(false);
    }
  };

  const onAccountDelete = async () => {
    await logOut();
    openToast({
      type: 'success',
      title: 'Account Deleted',
      description: 'Your account has been deleted and you have been signed out.',
    });
  };

  const isLoading = !user && !error;

  return (
    <>
      <Section>
        <ErrorModal error={updateError} setError={setUpdateError} />

        <Form.Root disabled={formState.isSubmitting} onSubmit={handleSubmit(submitSettings)}>
          <Flex stack gap="l">
            <Flex justify="spaceBetween">
              <H1>User Settings</H1>
              {isEditing && <Button type="submit">Done</Button>}
              {!isEditing && <Button onClick={edit}>Edit</Button>}
            </Flex>

            <HR />

            {error && <Message type="error" content="Could not fetch account data." />}

            <Form.HorizontalGroup>
              <Form.Label htmlFor="displayName">Display Name:</Form.Label>
              <Form.Group maxWidth="m">
                {isEditing ? (
                  <>
                    <Form.Input
                      id="displayName"
                      isInvalid={!!formState.errors.displayName}
                      placeholder="John Nearian"
                      {...register('displayName', formValidations.displayName)}
                    />
                    <Form.Feedback>{formState.errors.displayName?.message}</Form.Feedback>
                  </>
                ) : (
                  <>{isLoading ? <Spinner size="xs" /> : user?.name}</>
                )}
              </Form.Group>

              <Form.Label>Email:</Form.Label>
              <Form.Group maxWidth="m">{isLoading ? <Spinner size="xs" /> : user?.email}</Form.Group>
            </Form.HorizontalGroup>
          </Flex>
        </Form.Root>
      </Section>

      <Section>
        <Flex justify="spaceBetween" align="center">
          <H4>Delete</H4>
          <Button color="danger" onClick={() => setShowDeleteAccountModal(true)}>
            Delete Account
          </Button>
        </Flex>
      </Section>
      <DeleteAccountModal
        show={showDeleteAccountModal}
        setShow={setShowDeleteAccountModal}
        onDelete={onAccountDelete}
      />
    </>
  );
};

Settings.getLayout = useDashboardLayout;

export default Settings;

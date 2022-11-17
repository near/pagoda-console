import { useMutation } from '@tanstack/react-query';
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
import { useQuery } from '@/hooks/query';
import { useIdentity } from '@/hooks/user';
import DeleteAccountModal from '@/modules/core/components/modals/DeleteAccountModal';
import { logOut } from '@/utils/auth';
import { formValidations } from '@/utils/constants';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

interface SettingsFormData {
  displayName: string;
}

const Settings: NextPageWithLayout = () => {
  const { register, handleSubmit, formState, setValue } = useForm<SettingsFormData>();
  const [isEditing, setIsEditing] = useState(false);
  const userQuery = useQuery(['/users/getAccountDetails']);
  const identity = useIdentity();
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const updateDisplayNameMutation = useMutation<void, unknown, { displayName: string }>(
    ['displayName'],
    async ({ displayName }) => {
      if (!identity) {
        return;
      }
      updateProfile(identity, { displayName });
    },
    {
      onSuccess: (_, variables) => {
        if (!identity) {
          return;
        }
        getIdToken(identity, true);
        userQuery.updateCache((data) => {
          if (data) {
            return {
              ...data,
              name: variables.displayName,
            };
          }
        });
      },
      onSettled: () => setIsEditing(false),
    },
  );

  function edit() {
    setValue('displayName', userQuery.data!.name!);
    setIsEditing(true);
  }

  const submitSettings: SubmitHandler<SettingsFormData> = ({ displayName }) =>
    updateDisplayNameMutation.mutate({ displayName });

  const onAccountDelete = async () => {
    await logOut();
    openToast({
      type: 'success',
      title: 'Account Deleted',
      description: 'Your account has been deleted and you have been signed out.',
    });
  };

  return (
    <>
      <Section>
        <ErrorModal
          error={updateDisplayNameMutation.error ? String(updateDisplayNameMutation.error) : null}
          resetError={updateDisplayNameMutation.reset}
        />

        <Form.Root disabled={formState.isSubmitting} onSubmit={handleSubmit(submitSettings)}>
          <Flex stack gap="l">
            <Flex justify="spaceBetween">
              <H1>User Settings</H1>
              {isEditing && (
                <Button stableId={StableId.USER_SETTINGS_SAVE_BUTTON} type="submit">
                  Done
                </Button>
              )}
              {!isEditing && (
                <Button stableId={StableId.USER_SETTINGS_EDIT_BUTTON} onClick={edit}>
                  Edit
                </Button>
              )}
            </Flex>

            <HR />

            {userQuery.status === 'error' && <Message type="error" content="Could not fetch account data." />}

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
                  <>{userQuery.isLoading ? <Spinner size="xs" /> : userQuery.data?.name}</>
                )}
              </Form.Group>

              <Form.Label>Email:</Form.Label>
              <Form.Group maxWidth="m">
                {userQuery.isLoading ? <Spinner size="xs" /> : userQuery.data?.email}
              </Form.Group>
            </Form.HorizontalGroup>
          </Flex>
        </Form.Root>
      </Section>

      <Section>
        <Flex justify="spaceBetween" align="center">
          <H4>Delete</H4>
          <Button
            stableId={StableId.USER_SETTINGS_OPEN_DELETE_ACCOUNT_MODAL_BUTTON}
            color="danger"
            onClick={() => setShowDeleteAccountModal(true)}
          >
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

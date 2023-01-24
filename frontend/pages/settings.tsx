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
import { ErrorModal } from '@/components/modals/ErrorModal';
import { useAccount, useAuth } from '@/hooks/auth';
import { useDashboardLayout } from '@/hooks/layouts';
import DeleteAccountModal from '@/modules/core/components/modals/DeleteAccountModal';
import { formValidations } from '@/utils/constants';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

interface SettingsFormData {
  displayName: string;
}

const Settings: NextPageWithLayout = () => {
  const { register, handleSubmit, formState, setValue } = useForm<SettingsFormData>();
  const [isEditing, setIsEditing] = useState(false);
  const { user, error, mutate } = useAccount();
  const { identity } = useAuth();
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  const updateDisplayNameMutation = useMutation(
    async ({ displayName }: SettingsFormData) => {
      if (!identity) {
        return;
      }
      await updateProfile(identity, { displayName });
    },
    {
      onSuccess: (_, variables) => {
        if (!identity) {
          return;
        }

        getIdToken(identity, true);

        /*
          When the name is updated, there's a slight delay in getting back
          the updated displayName value from "/users/getAccountDetails". This
          is why "revalidate: false" is needed. Otherwise, the user would see
          their old displayName value after updating.
        */

        mutate(
          (data) => {
            if (data) {
              return {
                ...data,
                name: variables.displayName,
              };
            }
          },
          {
            revalidate: false,
          },
        );
      },
      onSettled: () => setIsEditing(false),
    },
  );

  function edit() {
    setValue('displayName', user!.name!);
    setIsEditing(true);
  }

  const submitSettings: SubmitHandler<SettingsFormData> = ({ displayName }) => {
    updateDisplayNameMutation.mutate({ displayName });
  };

  const isLoading = !user && !error;

  return (
    <>
      <Section>
        <ErrorModal
          error={updateDisplayNameMutation.error ? String(updateDisplayNameMutation.error) : null}
          resetError={updateDisplayNameMutation.reset}
        />

        <Form.Root disabled={updateDisplayNameMutation.isLoading} onSubmit={handleSubmit(submitSettings)}>
          <Flex stack gap="l">
            <Flex justify="spaceBetween" align="center">
              <H1>User Settings</H1>
              {isEditing && (
                <Button
                  stableId={StableId.USER_SETTINGS_SAVE_BUTTON}
                  type="submit"
                  loading={updateDisplayNameMutation.isLoading}
                >
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
                      stableId={StableId.USER_SETTINGS_DISPLAY_NAME_INPUT}
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
          <Button
            stableId={StableId.USER_SETTINGS_OPEN_DELETE_ACCOUNT_MODAL_BUTTON}
            color="danger"
            onClick={() => setShowDeleteAccountModal(true)}
          >
            Delete Account
          </Button>
        </Flex>
      </Section>
      <DeleteAccountModal show={showDeleteAccountModal} setShow={setShowDeleteAccountModal} />
    </>
  );
};

Settings.getLayout = useDashboardLayout;

export default Settings;

import { getIdToken, updateProfile } from 'firebase/auth';
import { useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H1 } from '@/components/lib/Heading';
import { HR } from '@/components/lib/HorizontalRule';
import { Message } from '@/components/lib/Message';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
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

  return (
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
  );
};

Settings.getLayout = useDashboardLayout;

export default Settings;

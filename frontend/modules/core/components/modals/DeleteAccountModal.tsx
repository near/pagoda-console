import Link from 'next/link';
import React, { useState } from 'react';

import { List, ListItem } from '@/components/lib/List';
import { Message } from '@/components/lib/Message';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useMutation } from '@/hooks/mutation';
import { useQuery } from '@/hooks/query';
import { useIdentity } from '@/hooks/user';
import { StableId } from '@/utils/stable-ids';

export default function DeleteAccountModal({
  show,
  setShow,
  onDelete,
}: {
  show: boolean;
  setShow: (show: boolean) => void;
  onDelete: () => void;
}) {
  const identity = useIdentity();
  const [errorText, setErrorText] = useState<string | undefined>();
  const orgsWithOnlyAdminQuery = useQuery(['/users/listOrgsWithOnlyAdmin']);
  const deleteAccountMutation = useMutation('/users/deleteAccount', {
    onSuccess: onDelete,
    onError: () => setErrorText('Something went wrong while deleting an account.'),
  });
  const orgsWithOnlyAdmin = orgsWithOnlyAdminQuery.data ?? [];

  return (
    <ConfirmModal
      confirmColor="danger"
      confirmText="Delete"
      errorText={errorText}
      isProcessing={deleteAccountMutation.isLoading}
      onConfirm={deleteAccountMutation.mutate}
      resetError={deleteAccountMutation.reset}
      setShow={setShow}
      show={show}
      disabled={orgsWithOnlyAdmin.length > 0}
      title={`Delete Account`}
    >
      {orgsWithOnlyAdmin.length > 0 ? (
        <>
          <Message type="warning">
            <Text color="warning">Your account currently owns the following organizations:</Text>
          </Message>

          <List>
            {orgsWithOnlyAdmin.map(({ name, slug }) => (
              <ListItem key={slug}>
                <Link href={`/organizations/${slug}`} passHref>
                  <TextLink stableId={StableId.DELETE_ACCOUNT_MODAL_ORGANIZATION_LINK}>{name}</TextLink>
                </Link>
              </ListItem>
            ))}
          </List>

          <Text color="text1">
            You must remove yourself from these organizations or delete them before deactivating your account.
          </Text>
        </>
      ) : (
        <>
          <Text>
            This action is permanent and can&apos;t be undone. Are you sure you want to delete the following account?
          </Text>
          <Text color="text1">{identity?.email}</Text>
        </>
      )}
    </ConfirmModal>
  );
}

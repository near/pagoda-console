import Link from 'next/link';
import React, { useState } from 'react';

import { List, ListItem } from '@/components/lib/List';
import { Message } from '@/components/lib/Message';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useOrgsWithOnlyAdmin } from '@/hooks/organizations';
import { deleteAccount, useIdentity } from '@/hooks/user';
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
  const [isDeleting, setIsDeleting] = useState(false);
  const { organizations } = useOrgsWithOnlyAdmin();

  async function onConfirm() {
    setIsDeleting(true);

    const success = await deleteAccount(identity?.uid);

    if (success) {
      onDelete();
    } else {
      setErrorText('Something went wrong while deleting an account.');
      setIsDeleting(false);
    }
  }

  const isOnlyAdmin = organizations && organizations.length > 0;

  return (
    <ConfirmModal
      confirmColor="danger"
      confirmText="Delete"
      errorText={errorText}
      isProcessing={isDeleting}
      onConfirm={onConfirm}
      setErrorText={setErrorText}
      setShow={setShow}
      show={show}
      disabled={isOnlyAdmin}
      title={`Delete Account`}
    >
      {isOnlyAdmin ? (
        <>
          <Message type="warning">
            <Text color="warning">Your account currently owns the following organizations:</Text>
          </Message>

          <List>
            {organizations.map(({ name, slug }) => (
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

import Link from 'next/link';

import { List, ListItem } from '@/components/lib/List';
import { Message } from '@/components/lib/Message';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { openToast } from '@/components/lib/Toast';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useAuth } from '@/hooks/auth';
import { useSignOut } from '@/hooks/auth';
import { useMutation } from '@/hooks/mutation';
import { useOrgsWithOnlyAdmin } from '@/hooks/organizations';
import { StableId } from '@/utils/stable-ids';

export default function DeleteAccountModal({ show, setShow }: { show: boolean; setShow: (show: boolean) => void }) {
  const { identity } = useAuth();
  const { organizations } = useOrgsWithOnlyAdmin();
  const signOut = useSignOut();

  const deleteAccountMutation = useMutation('/users/deleteAccount', {
    onSuccess: () => {
      openToast({
        type: 'success',
        title: 'Account Deleted',
        description: 'Your account has been deleted and you have been signed out.',
      });
      void signOut();
    },
    getAnalyticsSuccessData: () => ({ uid: identity?.uid }),
    getAnalyticsErrorData: () => ({ uid: identity?.uid }),
  });

  const isOnlyAdmin = organizations && organizations.length > 0;

  return (
    <ConfirmModal
      confirmColor="danger"
      confirmText="Delete"
      errorText={
        deleteAccountMutation.status === 'error' ? 'Something went wrong while deleting an account.' : undefined
      }
      isProcessing={deleteAccountMutation.isLoading}
      onConfirm={deleteAccountMutation.mutate}
      resetError={deleteAccountMutation.reset}
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

import type { Api } from '@pc/common/types/api';
import { useState } from 'react';

import { Button } from '@/components/lib/Button';
import * as Dialog from '@/components/lib/Dialog';
import { Flex } from '@/components/lib/Flex';
import JwtStarterGuide from '@/modules/apis/components/JwtStarterGuide';
import { StableId } from '@/utils/stable-ids';

import { UploadJwtForm } from './UploadJwtForm';

type Project = Api.Query.Output<'/projects/getDetails'>;

interface Props {
  project?: Project;
}

export function JwtAuth({ project }: Props) {
  const [showJwtModal, setShowJwtModal] = useState(false);

  return (
    <Flex stack gap="l">
      <Button
        stableId={StableId.API_JWT_OPEN_CREATE_MODAL_BUTTON}
        css={{ alignSelf: 'flex-end' }}
        onClick={() => setShowJwtModal(true)}
      >
        Add Public Key
      </Button>
      <Flex stack>
        <Dialog.Root open={showJwtModal} onOpenChange={setShowJwtModal}>
          <Dialog.Content title="Add JWT Public Key" size="s">
            <UploadJwtForm setShow={setShowJwtModal} show={showJwtModal} project={project} />
          </Dialog.Content>
        </Dialog.Root>
      </Flex>

      <JwtStarterGuide />
    </Flex>
  );
}

import { useRouter } from 'next/router';
import { useRef, useState } from 'react';

import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Font } from '@/components/lib/Font';
import { H4, H5 } from '@/components/lib/Heading';
import { P } from '@/components/lib/Paragraph';
import { Placeholder } from '@/components/lib/Placeholder';
import * as Popover from '@/components/lib/Popover';
import { Section } from '@/components/lib/Section';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import DeleteProjectModal from '@/components/modals/DeleteProjectModal';
import StarterGuide from '@/components/StarterGuide';
import { useApiKeys } from '@/hooks/api-keys';
import { useDashboardLayout } from '@/hooks/layouts';
import { useSelectedProject } from '@/hooks/selected-project';
import analytics from '@/utils/analytics';
import { authenticatedPost } from '@/utils/http';
import type { NetOption } from '@/utils/types';
import type { NextPageWithLayout } from '@/utils/types';

const ROTATION_WARNING =
  'Are you sure you would like to rotate this API key? The current key will be invalidated and future calls made with it will be rejected.';

const ProjectSettings: NextPageWithLayout = () => {
  const { project } = useSelectedProject();
  const { keys, mutate: mutateKeys } = useApiKeys(project?.slug);
  const [showMainnetRotationModal, setShowMainnetRotationModal] = useState(false);
  const [showTestnetRotationModal, setShowTestnetRotationModal] = useState(false);

  // Tutorial projects do not have MAINNET keys.
  const hasMainnetKey = !project?.tutorial;

  async function rotateKey(net: NetOption) {
    showMainnetRotationModal && setShowMainnetRotationModal(false);
    showTestnetRotationModal && setShowTestnetRotationModal(false);

    const subId = net === 'MAINNET' ? 2 : 1;

    try {
      // clear current key from the UI
      mutateKeys((cachedKeys: Record<NetOption, string>) => {
        const clone = {
          ...cachedKeys,
        };
        delete clone[net];
        return clone;
      });

      await mutateKeys(async (cachedKeys: Record<NetOption, string>) => {
        const newKey = await authenticatedPost('/projects/rotateKey', { project: project?.slug, environment: subId });

        analytics.track('DC Rotate API Key', {
          status: 'success',
          net: net,
        });

        return {
          ...cachedKeys,
          ...newKey,
        };
      });
    } catch (e: any) {
      analytics.track('DC Rotate API Key', {
        status: 'failure',
        net: net,
        error: e.message,
      });
      // refetch just in case we cleared the old key from the UI but it was not actually rotated
      mutateKeys();
      // TODO log error
      throw new Error('Failed to rotate key');
    }
  }

  return (
    <>
      <Section>
        <Flex stack>
          <H4>API Keys</H4>

          {hasMainnetKey && (
            <>
              <ConfirmModal
                confirmText="Rotate"
                onConfirm={() => rotateKey('MAINNET')}
                setShow={setShowMainnetRotationModal}
                show={showMainnetRotationModal}
                title="Rotate Mainnet Key?"
              >
                <P>{ROTATION_WARNING}</P>
              </ConfirmModal>

              <KeyRow name="Mainnet" token={keys?.MAINNET} onRotateKey={() => setShowMainnetRotationModal(true)} />
            </>
          )}

          <ConfirmModal
            confirmText="Rotate"
            onConfirm={() => rotateKey('TESTNET')}
            setShow={setShowTestnetRotationModal}
            show={showTestnetRotationModal}
            title="Rotate Testnet Key?"
          >
            <P>{ROTATION_WARNING}</P>
          </ConfirmModal>

          <KeyRow name="Testnet" token={keys?.TESTNET} onRotateKey={() => setShowTestnetRotationModal(true)} />
        </Flex>
      </Section>

      <Section>
        <StarterGuide />
      </Section>

      <DeleteProject />
    </>
  );
};

ProjectSettings.getLayout = useDashboardLayout;

function DeleteProject() {
  const { project } = useSelectedProject();
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  if (!project) return null;

  return (
    <Section>
      <Flex justify="spaceBetween" align="center">
        <H4>Delete</H4>

        <Button color="danger" onClick={() => setShowModal(true)}>
          Remove Project
        </Button>
      </Flex>

      <DeleteProjectModal
        slug={project.slug}
        name={project.name}
        show={showModal}
        setShow={setShowModal}
        onDelete={() => router.push('/projects')}
      />
    </Section>
  );
}

function KeyRow(props: { name: string; token?: string; onRotateKey: () => void }) {
  const [keyObscured, setKeyObscured] = useState(true);
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const copiedTimer = useRef<NodeJS.Timeout>();

  function getObscuredKey(key: string) {
    return key.substring(0, 8) + `-••••-••••-••••-••••••••••••`;
  }

  function copyKey() {
    if (copiedTimer.current) {
      clearTimeout(copiedTimer.current);
    }

    props.token && navigator.clipboard.writeText(props.token);

    analytics.track('DC Copy API Key', {
      net: props.name,
    });

    setShowCopiedAlert(true);

    copiedTimer.current = setTimeout(() => {
      setShowCopiedAlert(false);
    }, 2000);
  }

  return (
    <Flex align="center" justify="spaceBetween">
      <Flex align="center" gap="l">
        <H5 css={{ width: '4.5rem' }}>{props.name}</H5>

        <Font family="number">
          {props.token ? (
            keyObscured ? (
              getObscuredKey(props.token)
            ) : (
              props.token
            )
          ) : (
            <Placeholder css={{ width: '10rem', height: '1rem' }} />
          )}
        </Font>
      </Flex>

      <Button color="neutral" onClick={() => setKeyObscured(!keyObscured)} disabled={!props.token}>
        <FeatherIcon icon={keyObscured ? 'eye-off' : 'eye'} />
      </Button>

      <Popover.Root open={showCopiedAlert} onOpenChange={setShowCopiedAlert}>
        <Popover.Anchor asChild>
          <Button color="neutral" onClick={copyKey} disabled={!props.token}>
            <FeatherIcon icon="copy" />
          </Button>
        </Popover.Anchor>

        <Popover.Content side="top">
          <P>Copied!</P>
        </Popover.Content>
      </Popover.Root>

      <Button color="neutral" onClick={() => props.onRotateKey()} disabled={!props.token}>
        Rotate
      </Button>
    </Flex>
  );
}

export default ProjectSettings;

import { faCopy, faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { Button, Overlay, Placeholder } from 'react-bootstrap';

import { P } from '@/components/lib/Paragraph';
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
    <div className="pageContainer">
      <div className="content">
        <div className="keysContainer">
          <h4>API Keys</h4>

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
        </div>
        <StarterGuide />
        <DeleteProject />
      </div>

      <style jsx>{`
        .pageContainer {
          display: flex;
          flex-direction: column;
        }
        .content {
          display: flex;
          flex-direction: column;
          row-gap: 2rem;
        }
        .titleContainer {
          margin-bottom: 2.75rem;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }
        .keysContainer {
          display: flex;
          flex-direction: column;
          row-gap: 1rem;
        }
      `}</style>
    </div>
  );
};

function DeleteProject() {
  const { project } = useSelectedProject();
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  if (!project) {
    return <></>;
  }

  return (
    <>
      <div className="deleteContainer">
        <DeleteProjectModal
          slug={project.slug}
          name={project.name}
          show={showModal}
          setShow={setShowModal}
          onDelete={() => router.push('/projects')}
        />
        <h4>Delete</h4>
        <Button variant="danger" onClick={() => setShowModal(true)}>
          Remove Project
        </Button>
      </div>
      <style jsx>{`
        .deleteContainer {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }
      `}</style>
    </>
  );
}

function KeyRow(props: { name: string; token?: string; onRotateKey: () => void }) {
  const [keyObscured, setKeyObscured] = useState(true);

  function getObscuredKey(key: string) {
    // const obscureChar = '*';
    // return key.substring(0, 4) + obscureChar.repeat(key.length - 4);
    return key.substring(0, 8) + `-••••-••••-••••-••••••••••••`;
  }

  const copyRef = useRef(null);
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const copiedTimer = useRef<NodeJS.Timeout>();
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
    <div className="keyRow">
      <span className="keyTitle">{props.name}</span>
      <span className="keyField">
        {props.token ? (
          keyObscured ? (
            getObscuredKey(props.token)
          ) : (
            props.token
          )
        ) : (
          <Placeholder animation="glow">
            <Placeholder xs={4} size="sm" style={{ borderRadius: '0.5em' }} />
          </Placeholder>
        )}
      </span>
      <div className="buttonsContainer">
        <Button variant="outline-primary" onClick={() => setKeyObscured(!keyObscured)} disabled={!props.token}>
          <FontAwesomeIcon icon={keyObscured ? faEyeSlash : faEye} />
        </Button>
        <Button variant="outline-primary" onClick={copyKey} disabled={!props.token}>
          <FontAwesomeIcon icon={faCopy} />
        </Button>
        <div className="rotateButton">
          <Button variant="outline-danger" onClick={() => props.onRotateKey()} disabled={!props.token} ref={copyRef}>
            Rotate
          </Button>
        </div>
        <Overlay
          target={copyRef}
          show={showCopiedAlert}
          popperConfig={{ modifiers: [{ name: 'offset', options: { offset: [0, 8] } }] }}
          placement="right"
        >
          {(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            { placement, arrowProps, show, popper, ...props },
          ) => (
            <div
              {...props}
              style={{
                backgroundColor: 'gray',
                padding: '0.25em 0.5em',
                color: 'white',
                borderRadius: 3,
                ...props.style,
              }}
            >
              Copied!
            </div>
          )}
        </Overlay>
      </div>
      <style jsx>{`
        .keyRow {
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        .keyField {
          flex-grow: 1;
          font-family: 'Source Code Pro', monospace;
        }
        .buttonsContainer {
          display: flex;
          flex-direction: row;
          column-gap: 0.5rem;
        }
        .buttonsContainer > :global(.btn) {
          width: 3rem;
        }
        .rotateButton > :global(.btn) {
          width: 6rem;
        }
        .keyTitle {
          width: 6rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

ProjectSettings.getLayout = useDashboardLayout;

export default ProjectSettings;

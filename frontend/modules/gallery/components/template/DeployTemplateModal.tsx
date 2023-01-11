import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { AuthStatusRenderer } from '@/components/AuthStatusRenderer';
import { GithubConnect } from '@/components/GithubConnect';
import { Button } from '@/components/lib/Button';
import * as Dialog from '@/components/lib/Dialog';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { HR } from '@/components/lib/HorizontalRule';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { useRouteParam } from '@/hooks/route';
import { AuthForm } from '@/modules/core/components/AuthForm';
import type { Template } from '@/stores/gallery/gallery';
import { StableId } from '@/utils/stable-ids';

interface Props {
  template: Template;
  show: boolean;
  setShow: (show: boolean) => void;
}

export function DeployTemplateModal({ setShow, ...props }: Props) {
  const successParam = useRouteParam('githubConnectSuccess');

  useEffect(() => {
    if (successParam === 'true') {
      setShow(true);
    }
  }, [setShow, successParam]);

  return (
    <Dialog.Root open={props.show} onOpenChange={setShow}>
      <Dialog.Content title="Deploy Template" size="s">
        {/* The modal content is broken out in to its own component so
        that we'll have a fresh instance each time this modal opens.
        Otherwise, we'd have to worry about manually resetting the state
        and form each time it opened or closed. */}

        <AuthStatusRenderer
          custom
          authenticated={<ModalContent setShow={setShow} {...props} />}
          unauthenticated={<UnauthenticatedModalContent />}
        />
      </Dialog.Content>
    </Dialog.Root>
  );
}

function ModalContent(props: Props) {
  return (
    <GithubConnect
      connected={<ConnectedModalContent {...props} />}
      unconnected={<UnconnectedModalContent {...props} />}
    />
  );
}

interface DeployFormData {
  repositoryName: string;
}

function ConnectedModalContent(props: Props) {
  const repositoryName = props.template.attributes.githubUrl.split('/').pop();
  const form = useForm<DeployFormData>({
    defaultValues: {
      repositoryName,
    },
  });

  function deploy(data: DeployFormData) {
    console.log(props.template.attributes, data);
    // TODO:
    // 1. Fire off deploy mutation
    // 2. Show loading state on "Deploy Repository" button
    // 3. Handle onSuccess/onError
  }

  return (
    <Flex stack>
      <Form.Root onSubmit={form.handleSubmit(deploy)}>
        <Flex stack>
          <Text>Deploying this template will create a new repository on your connected GitHub account.</Text>

          <Form.Group>
            <Form.FloatingLabelInput
              label="Repository Name"
              placeholder={props.template.attributes.name}
              stableId={StableId.GALLERY_DEPLOY_TEMPLATE_MODAL_REPO_NAME_INPUT}
              {...form.register('repositoryName')}
            />
          </Form.Group>

          <Button stableId={StableId.GALLERY_DEPLOY_TEMPLATE_MODAL_CONFIRM_BUTTON} type="submit" stretch>
            Deploy Repository
          </Button>

          <HR />

          <Flex justify="center">
            <TextLink
              href={props.template.attributes.githubUrl}
              stableId={StableId.GALLERY_DEPLOY_TEMPLATE_MODAL_VIEW_REPO_LINK}
              external
              size="s"
            >
              View Repository
            </TextLink>
          </Flex>
        </Flex>
      </Form.Root>
    </Flex>
  );
}

function UnconnectedModalContent(props: Props) {
  return (
    <Flex stack>
      <Text>
        To deploy this template, you&apos;ll need to connect your GitHub account. This will allow us to create and
        configure the{' '}
        <TextLink
          href={props.template.attributes.githubUrl}
          external
          stableId={StableId.GALLERY_DEPLOY_TEMPLATE_MODAL_VIEW_REPO_LINK}
        >
          Template Repository
        </TextLink>
      </Text>
    </Flex>
  );
}

function UnauthenticatedModalContent() {
  return (
    <Flex stack gap="l">
      <Text>To deploy this template, you&apos;ll need to sign in and connect your GitHub account:</Text>
      <AuthForm />
    </Flex>
  );
}

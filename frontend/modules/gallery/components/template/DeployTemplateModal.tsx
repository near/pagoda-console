import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { GithubConnect } from '@/components/GithubConnect';
import { Button, ButtonLink } from '@/components/lib/Button';
import * as Dialog from '@/components/lib/Dialog';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { openToast } from '@/components/lib/Toast';
import { useApiMutation } from '@/hooks/api-mutation';
import { useRouteParam } from '@/hooks/route';
import { useProjectSelector } from '@/hooks/selected-project';
import { AuthForm } from '@/modules/core/components/AuthForm';
import type { Template } from '@/stores/gallery/gallery';
import analytics from '@/utils/analytics';
import { handleMutationError } from '@/utils/error-handlers';
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

        {/* <AuthStatusRenderer
          custom
          authenticated={<ModalContent setShow={setShow} {...props} />}
          unauthenticated={<UnauthenticatedModalContent />}
        /> */}
        <ModalContent setShow={setShow} {...props} />
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
  githubUsername: string;
}

function ConnectedModalContent(props: Props) {
  const { selectProject } = useProjectSelector();
  const router = useRouter();

  const repositoryName = props.template.attributes.githubUrl.split('/').pop() as string;
  const form = useForm<DeployFormData>({
    defaultValues: {
      repositoryName: `${repositoryName}-copy`,
    },
  });

  const deployMutation = useApiMutation('/deploys/addDeploy', {
    onSuccess: (res) => {
      analytics.track('DC Deploy Gallery Template', {
        status: 'success',
        id: props.template.id,
      });

      const name = form.getValues('repositoryName') || repositoryName;

      openToast({
        type: 'success',
        title: 'Deploy Success',
        description: `Repository was created: ${name}`,
      });

      selectProject(res.projectSlug);
      router.push('/deploys');
      props.setShow(false);

      // TODO: Redirect to deploy module page to show progress?
    },
    onError: (error: any) => {
      handleMutationError({
        error,
        eventLabel: 'DC Deploy Gallery Template',
        eventData: {
          id: props.template.id,
        },
        toastTitle: 'Deploy Failure',
        toastDescription: error.statusCode === 400 ? error.message : 'Unknown error.',
      });
    },
  });

  function deploy(data: DeployFormData) {
    const githubRepoFullName = props.template.attributes.githubUrl.split('/').slice(-2).join('/');
    const projectName = data.repositoryName || repositoryName;
    const newGithubUsername = data.githubUsername;

    deployMutation.mutate({
      githubRepoFullName,
      projectName,
      newGithubUsername,
    });
  }

  return (
    <Flex stack>
      <Form.Root onSubmit={form.handleSubmit(deploy)}>
        <Flex stack>
          <Text>Deploying this template will create a new repository on your connected GitHub account.</Text>

          <Form.Group>
            <Form.FloatingLabelInput
              label="Github User Name"
              placeholder={'satoshi'}
              stableId={StableId.GALLERY_DEPLOY_TEMPLATE_MODAL_REPO_USER_NAME_INPUT}
              {...form.register('githubUsername')}
            />
            <Form.FloatingLabelInput
              label="Repository Name"
              placeholder={repositoryName}
              stableId={StableId.GALLERY_DEPLOY_TEMPLATE_MODAL_REPO_NAME_INPUT}
              {...form.register('repositoryName')}
            />
          </Form.Group>

          <Button
            stableId={StableId.GALLERY_DEPLOY_TEMPLATE_MODAL_CONFIRM_BUTTON}
            type="submit"
            stretch
            loading={deployMutation.isLoading}
          >
            Deploy
          </Button>

          <ButtonLink
            href={props.template.attributes.githubUrl}
            stableId={StableId.GALLERY_DEPLOY_TEMPLATE_MODAL_VIEW_REPO_LINK}
            external
            color="neutral"
            stretch
          >
            View Repository
          </ButtonLink>
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

export function UnauthenticatedModalContent() {
  return (
    <Flex stack gap="l">
      <Text>To deploy this template, you&apos;ll need to sign in and connect your GitHub account:</Text>
      <AuthForm />
    </Flex>
  );
}

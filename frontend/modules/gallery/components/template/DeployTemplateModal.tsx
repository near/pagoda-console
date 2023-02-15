import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';

import { AuthStatusRenderer } from '@/components/AuthStatusRenderer';
import { Button, ButtonLink } from '@/components/lib/Button';
import * as Dialog from '@/components/lib/Dialog';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { Text } from '@/components/lib/Text';
import { openToast } from '@/components/lib/Toast';
import { useApiMutation } from '@/hooks/api-mutation';
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
    <AuthStatusRenderer
      custom
      authenticated={<ConnectedModalContent {...props} />}
      unauthenticated={<UnauthenticatedModalContent />}
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
  const form = useForm<DeployFormData>();

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
    },
    onError: (error: any) => {
      let toastTitle, toastDescription;
      if (error.statusCode === 409) {
        toastTitle = 'Repository name already exists';
        toastDescription = 'Please choose a different name.';
      } else {
        toastTitle = 'Deploy Failure';
        toastDescription = error.statusCode === 400 ? error.message : 'Unknown error.';
      }
      handleMutationError({
        error,
        eventLabel: 'DC Deploy Gallery Template',
        eventData: {
          id: props.template.id,
        },
        toastTitle,
        toastDescription,
      });
    },
  });

  function deploy(data: DeployFormData) {
    const githubRepoFullName = props.template.attributes.githubUrl.split('/').slice(-2).join('/');
    const projectName = data.repositoryName || repositoryName;

    deployMutation.mutate({
      githubRepoFullName,
      projectName,
    });
  }

  return (
    <Flex stack>
      <Form.Root onSubmit={form.handleSubmit(deploy)}>
        <Flex stack>
          <Text>
            Deploying this template will create a new repository that you can transfer to your GitHub account.
          </Text>

          <Form.Group>
            <Form.FloatingLabelInput
              label="Repository Name"
              placeholder={repositoryName}
              stableId={StableId.GALLERY_DEPLOY_TEMPLATE_MODAL_REPO_NAME_INPUT}
              {...form.register('repositoryName', {
                required: true,
              })}
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

export function UnauthenticatedModalContent() {
  return (
    <Flex stack gap="l">
      <Text>To deploy this template, you&apos;ll need to sign in:</Text>
      <AuthForm />
    </Flex>
  );
}

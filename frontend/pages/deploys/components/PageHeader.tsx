import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Section } from '@/components/lib/Section';
import { openToast } from '@/components/lib/Toast';
import { useApiMutation } from '@/hooks/api-mutation';
import { useRepositories } from '@/hooks/deploys';
import { useSelectedProject } from '@/hooks/selected-project';
import analytics from '@/utils/analytics';
import { handleMutationError } from '@/utils/error-handlers';
import { StableId } from '@/utils/stable-ids';

const PageHeader = ({ showButtons }: { showButtons: boolean }) => {
  const project = useSelectedProject();
  const { repositories } = useRepositories(project.project?.slug);
  const repo = repositories?.[0];

  const triggerWorkflowMutation = useApiMutation('/deploys/triggerGithubWorkflow', {
    onSuccess: () => {
      analytics.track('DC Deploy Triggered Github Action', {
        status: 'success',
        githubRepoFullName: repo?.githubRepoFullName,
      });
      openToast({
        type: 'success',
        title: 'Deployment started!',
      });
    },
    onError: (error: any) => {
      const toastTitle = 'Deploy Failure';
      const toastDescription = error.statusCode === 400 ? error.message : 'Unknown error.';

      handleMutationError({
        error,
        eventLabel: 'DC Deploy Triggered Github Action',
        eventData: {
          githubRepoFullName: repo?.githubRepoFullName,
        },
        toastTitle,
        toastDescription,
      });
    },
  });

  // TODO add loading/waiting state
  function deploy() {
    if (!repo) {
      return;
    }
    triggerWorkflowMutation.mutate({
      repository: repo.slug,
    });
  }

  return repo ? (
    <Section>
      <Flex stack gap="l">
        <Flex align="center">
          <Flex align="center" justify="start">
            <FeatherIcon icon="git-branch" size="m" />
            <H1>Deploys</H1>
          </Flex>

          {showButtons && (
            <Flex justify="end">
              <Button color="neutral" stableId={StableId.DEPLOYS_DEPLOY} hideText="tablet" onClick={deploy}>
                <FeatherIcon icon="git-branch" /> Deploy to Testnet
              </Button>

              <Button
                color="neutral"
                stableId={StableId.DEPLOYS_GITHUB_REPO}
                hideText="tablet"
                onClick={() => window.open(`https://www.github.com/${repo.githubRepoFullName}`, '_blank')}
              >
                <FeatherIcon icon="share" /> GitHub Repo
              </Button>

              <Button
                stableId={StableId.DEPLOYS_CODE}
                hideText="tablet"
                onClick={() => window.open(`https://github.dev/${repo.githubRepoFullName}`, '_blank')}
              >
                <FeatherIcon icon="code" /> Code
              </Button>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Section>
  ) : null;
};

export default PageHeader;

import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Section } from '@/components/lib/Section';
import { useRepositories } from '@/hooks/deploys';
import { useSelectedProject } from '@/hooks/selected-project';
import { StableId } from '@/utils/stable-ids';

const PageHeader = ({ showButtons }: { showButtons: boolean }) => {
  const project = useSelectedProject();
  const { repositories } = useRepositories(project.project?.slug);

  const repo = repositories?.[0];

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

import { useState } from 'react';

import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Message } from '@/components/lib/Message';
import { Section } from '@/components/lib/Section';
import { useDeployments, useIsRepositoryTransferred, useRepositories } from '@/hooks/deploys';
import { useSelectedProject } from '@/hooks/selected-project';
import { TransferGithubModal } from '@/modules/gallery/components/template/TransferGithubModal';
import { StableId } from '@/utils/stable-ids';

const PageHeader = () => {
  const project = useSelectedProject();
  const { deployments = [] } = useDeployments(project.project?.slug);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const { repositories } = useRepositories(project.project?.slug);
  const hasAtLeastOneDeploy =
    deployments.length &&
    (deployments.some(({ frontendDeployments }) => frontendDeployments.length) ||
      deployments.some(({ contractDeployments }) => contractDeployments.length));

  function openTransferModal() {
    setShowTransferModal(true);
  }

  const repo = repositories?.[0];

  const { isRepositoryTransferred } = useIsRepositoryTransferred(repo?.slug);

  return repo ? (
    <>
      <Section>
        <Flex stack gap="l">
          <Flex align="center">
            <Flex align="center" justify="start">
              <FeatherIcon icon="git-branch" size="m" />
              <H1>Deploys</H1>
            </Flex>

            <Flex justify="end">
              <Button
                color="neutral"
                stableId={StableId.DEPLOYS_GITHUB_REPO}
                hideText="tablet"
                onClick={() => window.open(`https://www.github.com/${repo.githubRepoFullName}`, '_blank')}
              >
                <FeatherIcon icon="share" /> GitHub Repo
              </Button>

              {isRepositoryTransferred ? (
                <Button
                  stableId={StableId.DEPLOYS_CODE}
                  hideText="tablet"
                  onClick={() => window.open(`https://github.dev/${repo.githubRepoFullName}`, '_blank')}
                >
                  <FeatherIcon icon="code" /> Code
                </Button>
              ) : null}
            </Flex>
          </Flex>
        </Flex>
        {hasAtLeastOneDeploy && isRepositoryTransferred === false ? (
          <Message
            onClickButton={openTransferModal}
            buttonText={'Transfer'}
            icon="github"
            content="Transfer the repository to your personal Github to start making code changes."
            style={{ marginTop: 20 }}
          />
        ) : null}
      </Section>
      <TransferGithubModal repository={repo} show={showTransferModal} setShow={setShowTransferModal} />
    </>
  ) : null;
};

export default PageHeader;

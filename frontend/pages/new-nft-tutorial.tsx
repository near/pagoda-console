import Link from 'next/link';
import { useRouter } from 'next/router';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { useSimpleLogoutLayout } from '@/hooks/layouts';
import { ProjectCard } from '@/modules/core/components/ProjectCard';
import analytics from '@/utils/analytics';
import { formValidations } from '@/utils/constants';
import { authenticatedPost } from '@/utils/http';
import { StableId } from '@/utils/stable-ids';
import type { Project } from '@/utils/types';
import type { NextPageWithLayout } from '@/utils/types';

interface NewProjectFormData {
  projectName: string;
}

const NewNftTutorial: NextPageWithLayout = () => {
  const { register, handleSubmit, formState, setError } = useForm<NewProjectFormData>();
  const router = useRouter();

  // Project name is tutorial name. Path is the mdx file for the tutorial.
  const createProject: SubmitHandler<NewProjectFormData> = async ({ projectName }) => {
    const path = '/tutorials/nfts/introduction';
    const tutorial = 'NFT_MARKET';
    const name = projectName;

    try {
      router.prefetch(path);
      const project: Project = await authenticatedPost<Project>('/projects/create', {
        name,
        tutorial,
      });
      analytics.track('DC Create New NFT Tutorial Project', {
        status: 'success',
        name,
      });
      router.push(`${path}?project=${project.slug}&environment=1`);
    } catch (e: any) {
      analytics.track('DC Create New NFT Tutorial Project', {
        status: 'failure',
        name,
        error: e.message,
      });
      setError('projectName', {
        message: 'Something went wrong',
      });
    }
  };

  return (
    <Container size="m">
      <Flex gap="l">
        <ProjectCard
          title="NFT Market"
          description="Start by minting an NFT using a pre-deployed contract, then build up to a fully-fledged NFT marketplace."
          readonly
        />

        <Flex stack gap="l">
          <Link href="/pick-tutorial" passHref>
            <TextLink stableId={StableId.NEW_NFT_TUTORIAL_BACK_TO_TUTORIAL_TYPE_LINK}>
              <FeatherIcon icon="arrow-left" /> Tutorial Type
            </TextLink>
          </Link>

          <Text>
            {
              "In this Zero to Hero series, you'll find a set of tutorials that will cover every aspect of a non-fungible token (NFT) smart contract. You'll start by minting an NFT using a pre-deployed contract and by the end you'll end up building a fully-fledged NFT smart contract that supports every extension."
            }
          </Text>

          <Form.Root disabled={formState.isSubmitting} onSubmit={handleSubmit(createProject)}>
            <Flex stack align="end">
              <Form.Group>
                <Form.Label htmlFor="projectName">Project Name</Form.Label>
                <Form.Input
                  id="projectName"
                  isInvalid={!!formState.errors.projectName}
                  placeholder="Cool New Project"
                  {...register('projectName', formValidations.projectName)}
                />
                <Form.Feedback>{formState.errors.projectName?.message}</Form.Feedback>
              </Form.Group>

              <Button stableId={StableId.NEW_NFT_TUTORIAL_CREATE_BUTTON} type="submit" loading={formState.isSubmitting}>
                Create Project
              </Button>
            </Flex>
          </Form.Root>
        </Flex>
      </Flex>
    </Container>
  );
};

NewNftTutorial.getLayout = useSimpleLogoutLayout;

export default NewNftTutorial;

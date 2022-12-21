import Link from 'next/link';
import { useRouter } from 'next/router';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { Section } from '@/components/lib/Section';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { useSimpleLogoutLayout } from '@/hooks/layouts';
import { useMutation } from '@/hooks/mutation';
import { ProjectCard } from '@/modules/core/components/ProjectCard';
import { formValidations } from '@/utils/constants';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

interface NewProjectFormData {
  projectName: string;
}
const PATH = '/tutorials/nfts/introduction';
const TUTORIAL = 'NFT_MARKET';

const NewNftTutorial: NextPageWithLayout = () => {
  const { register, handleSubmit, formState } = useForm<NewProjectFormData>();
  const router = useRouter();
  const createProjectMutation = useMutation('/projects/create', {
    onMutate: () => router.prefetch(PATH),
    onSuccess: (result) => router.push(`${PATH}?project=${result.slug}&environment=1`),
    getAnalyticsSuccessData: (variables) => ({ name: variables.name }),
    getAnalyticsErrorData: (variables) => ({ name: variables.name }),
  });
  const mutationError =
    createProjectMutation.status === 'error'
      ? (createProjectMutation.error as any).statusCode === 409
        ? 'Project name is already in use'
        : 'Something went wrong'
      : undefined;

  const createProject: SubmitHandler<NewProjectFormData> = ({ projectName }) => {
    createProjectMutation.mutate({ name: projectName, tutorial: TUTORIAL });
  };

  return (
    <Section>
      <Container size="m">
        <Flex gap="l" stack={{ '@tablet': true }}>
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

            <Form.Root disabled={createProjectMutation.isLoading} onSubmit={handleSubmit(createProject)}>
              <Flex stack align="end">
                <Form.Group>
                  <Form.Label htmlFor="projectName">Project Name</Form.Label>
                  <Form.Input
                    id="projectName"
                    isInvalid={!!formState.errors.projectName}
                    placeholder="Cool New Project"
                    stableId={StableId.NEW_NFT_TUTORIAL_PROJECT_NAME_INPUT}
                    {...register('projectName', formValidations.projectName)}
                  />
                  <Form.Feedback>{mutationError || formState.errors.projectName?.message}</Form.Feedback>
                </Form.Group>

                <Button
                  stableId={StableId.NEW_NFT_TUTORIAL_CREATE_BUTTON}
                  type="submit"
                  loading={createProjectMutation.isLoading}
                >
                  Create Project
                </Button>
              </Flex>
            </Form.Root>
          </Flex>
        </Flex>
      </Container>
    </Section>
  );
};

NewNftTutorial.getLayout = useSimpleLogoutLayout;

export default NewNftTutorial;

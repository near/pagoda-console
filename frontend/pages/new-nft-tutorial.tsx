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
import { useApiMutation } from '@/hooks/api-mutation';
import { useSimpleLogoutLayout } from '@/hooks/layouts';
import { ProjectCard } from '@/modules/core/components/ProjectCard';
import analytics from '@/utils/analytics';
import { formValidations } from '@/utils/constants';
import { handleMutationError } from '@/utils/error-handlers';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

interface NewProjectFormData {
  projectName: string;
}
const PATH = '/tutorials/nfts/introduction';
const TUTORIAL = 'NFT_MARKET';

const NewNftTutorial: NextPageWithLayout = () => {
  const { register, handleSubmit, formState, setError } = useForm<NewProjectFormData>();
  const router = useRouter();

  const createProjectMutation = useApiMutation('/projects/create', {
    onMutate: () => router.prefetch(PATH),
    onSuccess: (result, variables) => {
      analytics.track('DC Create New NFT Tutorial Project', {
        status: 'success',
        name: variables.name,
      });

      router.push(`${PATH}?project=${result.slug}&environment=1`);
    },
    onError: (error, variables) => {
      switch ((error as any).statusCode) {
        case 409:
          setError('projectName', {
            message: 'Project name is already in use',
          });
          break;

        default:
          handleMutationError({
            error,
            eventLabel: 'DC Create New NFT Tutorial Project',
            eventData: {
              name: variables.name,
            },
            toastTitle: 'Failed to create project.',
          });
      }
    },
  });

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
                  <Form.Feedback>{formState.errors.projectName?.message}</Form.Feedback>
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

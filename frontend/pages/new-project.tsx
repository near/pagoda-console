import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useCallback, useEffect } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Checkbox, CheckboxGroup } from '@/components/lib/Checkbox';
import { Container } from '@/components/lib/Container';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H1, H5 } from '@/components/lib/Heading';
import { Section } from '@/components/lib/Section';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { useSimpleLogoutLayout } from '@/hooks/layouts';
import { useOrganizations } from '@/hooks/organizations';
import { useRouteParam } from '@/hooks/route';
import { usePublicStore } from '@/stores/public';
import analytics from '@/utils/analytics';
import { formValidations } from '@/utils/constants';
import { fetchApi } from '@/utils/http';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const PERSONAL_ORGANIZATION_NAME = 'Personal organization';

interface NewProjectFormData {
  projectName: string;
  projectOrg: string;
}

const NewProject: NextPageWithLayout = () => {
  const { register, handleSubmit, formState, setError, getValues, watch, setValue } = useForm<NewProjectFormData>();
  const router = useRouter();
  const isOnboarding = useRouteParam('onboarding');
  const publicModeContracts = usePublicStore((store) => store.contracts);
  const setPublicModeContracts = usePublicStore((store) => store.setContracts);
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);
  const { organizations = [] } = useOrganizations(false);

  useEffect(() => {
    if (organizations.length !== 0 && !getValues('projectOrg')) {
      const personalOrg = organizations.find((organization) => organization.isPersonal);
      const selectedOrg = personalOrg || organizations[0];
      setValue('projectOrg', selectedOrg.slug);
    }
  }, [organizations, getValues, setValue]);

  useEffect(() => {
    const addresses = publicModeContracts.map((contract) => contract.address);
    setSelectedAddresses(addresses);
  }, [publicModeContracts]);

  const createProject: SubmitHandler<NewProjectFormData> = async ({ projectName, projectOrg }) => {
    try {
      router.prefetch('/apis?tab=keys');

      const project = await fetchApi(['/projects/create', { name: projectName, org: projectOrg }]);

      selectedAddresses.forEach((address) => {
        const contract = publicModeContracts.find((c) => c.address === address);

        if (contract) {
          fetchApi([
            '/projects/addContract',
            {
              project: project.slug,
              environment: contract.net === 'TESTNET' ? 1 : 2,
              address: contract.address,
            },
          ]).catch((e) => console.error(e));
        }
      });

      analytics.track('DC Create New Project', {
        status: 'success',
        name: projectName,
        publicMode: publicModeContracts.length > 0,
        includedPublicModeAddresses: selectedAddresses,
      });

      setPublicModeContracts([]);

      await router.push(`/apis?tab=keys&project=${project.slug}`);
    } catch (e: any) {
      analytics.track('DC Create New Project', {
        status: 'failure',
        name: projectName,
        error: e.message,
      });

      if (e.statusCode === 409) {
        setError('projectName', {
          message: 'Project name is already in use',
        });
      } else {
        setError('projectName', {
          message: 'Something went wrong',
        });
      }
    }
  };

  const setProjectOrg = useCallback((value: string) => setValue('projectOrg', value), [setValue]);

  const selectedOrganizationSlug = watch('projectOrg');
  const selectedOrganization = organizations.find((organization) => organization.slug === selectedOrganizationSlug);
  const selectedOrganizationName = selectedOrganization
    ? selectedOrganization.isPersonal
      ? PERSONAL_ORGANIZATION_NAME
      : selectedOrganization.name
    : '...';

  function onCheckboxChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelectedAddresses((addresses) => {
        return [...addresses, e.target.value];
      });
    } else {
      setSelectedAddresses((addresses) => {
        return addresses.filter((a) => a !== e.target.value);
      });
    }
  }

  return (
    <Section>
      <Container size="s">
        <Flex stack gap="l">
          <Flex stack>
            <Link href="/pick-project" passHref>
              <TextLink stableId={StableId.NEW_PROJECT_BACK_TO_PROJECT_TYPE_LINK}>
                <FeatherIcon icon="arrow-left" /> Project Type
              </TextLink>
            </Link>

            <H1>New Project</H1>
          </Flex>

          {isOnboarding && (
            <Text>
              One last thing! Before we let you loose on the Developer Console, you’ll need to create a project.
              Projects contain API keys and any smart contracts you wish to track.
            </Text>
          )}

          <Form.Root disabled={formState.isSubmitting} onSubmit={handleSubmit(createProject)}>
            <Flex stack align="end" gap="l">
              <Flex stack>
                <Form.Group>
                  <Form.FloatingLabelInput
                    label="Project Name"
                    id="projectName"
                    isInvalid={!!formState.errors.projectName}
                    placeholder="Cool New Project"
                    {...register('projectName', formValidations.projectName)}
                  />
                  <Form.Feedback>{formState.errors.projectName?.message}</Form.Feedback>
                </Form.Group>

                {organizations.length > 1 ? (
                  <Form.Group>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <Form.FloatingLabelSelect
                          label="Organization"
                          isInvalid={!!formState.errors.projectOrg}
                          {...register('projectOrg')}
                          selection={selectedOrganizationName}
                        />
                      </DropdownMenu.Trigger>

                      <DropdownMenu.Content width="trigger">
                        <DropdownMenu.RadioGroup value={selectedOrganizationName} onValueChange={setProjectOrg}>
                          {organizations.map((organization) => (
                            <DropdownMenu.RadioItem
                              value={organization.slug}
                              key={organization.slug}
                              data-state={organization.slug === selectedOrganizationSlug ? 'checked' : 'unchecked'}
                            >
                              {organization.isPersonal ? PERSONAL_ORGANIZATION_NAME : organization.name}
                            </DropdownMenu.RadioItem>
                          ))}
                        </DropdownMenu.RadioGroup>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  </Form.Group>
                ) : null}
              </Flex>

              {publicModeContracts.length > 0 && (
                <Flex stack>
                  <H5>Include Contracts</H5>

                  <CheckboxGroup aria-label="Select contracts to import" css={{ width: '100%' }}>
                    {publicModeContracts.map((c) => (
                      <Checkbox
                        key={c.address}
                        value={c.address}
                        name={`importPublicContracts-${c.address}`}
                        onChange={onCheckboxChange}
                        checked={selectedAddresses.includes(c.address)}
                      >
                        {c.address}
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                </Flex>
              )}

              <Button stableId={StableId.NEW_PROJECT_CREATE_BUTTON} loading={formState.isSubmitting} type="submit">
                Create Project
              </Button>
            </Flex>
          </Form.Root>
        </Flex>
      </Container>
    </Section>
  );
};

NewProject.getLayout = useSimpleLogoutLayout;

export default NewProject;

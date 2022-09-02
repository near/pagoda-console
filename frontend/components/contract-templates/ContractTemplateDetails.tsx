import { Button, ButtonLink } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import { H3 } from '@/components/lib/Heading';
import { Text } from '@/components/lib/Text';
import type { ContractTemplate } from '@/hooks/contract-templates';
import { styled } from '@/styles/stitches';

const Image = styled('img', {
  aspectRatio: '16 / 10',
  borderRadius: 'var(--border-radius-xs)',
});

type Props = {
  isDeploying: boolean;
  template: ContractTemplate;
  onSelect: (template: ContractTemplate) => void;
};

export function ContractTemplateDetails({ isDeploying, template, onSelect }: Props) {
  if (!template) return null;

  return (
    <Flex stack gap="l">
      <Image src={template.image} alt={template.title} />

      <Flex stack>
        <H3>{template.title}</H3>
        <Text color="text2">{template.detailSummary}</Text>
        <Text color="text2">{template.instructions}</Text>
      </Flex>

      <Flex stack gap="m">
        <Button
          loading={isDeploying}
          color="primary"
          onClick={() => {
            onSelect(template);
          }}
          stretch
        >
          Deploy & Explore Contract
        </Button>

        <ButtonLink href={template.repositoryUrl} color="neutral" external stretch>
          View on Github
        </ButtonLink>
      </Flex>
    </Flex>
  );
}

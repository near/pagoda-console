import { Flex } from '@/components/lib/Flex';
import type { ContractTemplate } from '@/hooks/contract-templates';
import { useContractTemplates } from '@/hooks/contract-templates';

import { ContractTemplateListItem } from './ContractTemplateListItem';

type Props = {
  noThumbnails?: boolean;
  onSelect: (template: ContractTemplate) => void;
};

export function ContractTemplateList({ noThumbnails, onSelect }: Props) {
  const templates = useContractTemplates();

  return (
    <Flex stack gap={noThumbnails ? 'm' : 'l'}>
      {templates.map((template) => (
        <ContractTemplateListItem
          key={template.title}
          disabled={!template.isEnabled}
          image={template.image}
          onClick={() => onSelect(template)}
          summary={template.listSummary}
          title={template.title}
          noThumbnail={noThumbnails}
        />
      ))}
    </Flex>
  );
}

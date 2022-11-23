import type { Api } from '@pc/common/types/api';
import type { ReactElement } from 'react';

import { GetPublicModeWrapper } from '@/components/lib/PublicModeWrapper';
import { withSelectedProject } from '@/components/with-selected-project';
import { useContracts } from '@/hooks/contracts';
import { useSureProjectContext } from '@/hooks/project-context';
import { usePublicStore } from '@/stores/public';

type Contracts = Api.Query.Output<'/projects/getContracts'>;

type ChildrenProps = {
  contracts: Contracts;
  isPublicMode: boolean;
};

type Props = { children: (props: ChildrenProps) => ReactElement | null };

const PublicContractsWrapper = ({ children }: Props) => {
  const contracts = usePublicStore((store) => store.contracts);
  return children({ contracts, isPublicMode: true });
};

const PrivateContractsWrapper = withSelectedProject(({ children }: Props) => {
  const { projectSlug, environmentSubId } = useSureProjectContext();
  const { contracts } = useContracts(projectSlug, environmentSubId);
  return children({
    contracts: contracts || [],
    isPublicMode: false,
  });
});

export const ContractsWrapper = GetPublicModeWrapper<Props>(PublicContractsWrapper, PrivateContractsWrapper);

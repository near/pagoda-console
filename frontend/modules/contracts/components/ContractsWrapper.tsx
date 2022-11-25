import { useQuery as useRawQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';

import { GetPublicModeWrapper } from '@/components/lib/PublicModeWrapper';
import { withSelectedProject } from '@/components/with-selected-project';
import { useSureProjectContext } from '@/hooks/project-context';
import type { UseQueryResult } from '@/hooks/query';
import { useQuery } from '@/hooks/query';
import { usePublicStore } from '@/stores/public';

type ChildrenProps = {
  contractsQuery: UseQueryResult<'/projects/getContracts'>;
  isPublicMode: boolean;
};

type Props = { children: (props: ChildrenProps) => ReactElement | null };

const PublicContractsWrapper = ({ children }: Props) => {
  const contracts = usePublicStore((store) => store.contracts);
  const contractsQuery = useRawQuery(['public-contracts'], () => contracts);
  return children({
    contractsQuery: contractsQuery,
    isPublicMode: true,
  });
};

const PrivateContractsWrapper = withSelectedProject(({ children }: Props) => {
  const { projectSlug, environmentSubId } = useSureProjectContext();
  const contractsQuery = useQuery(['/projects/getContracts', { project: projectSlug, environment: environmentSubId }]);
  return children({
    contractsQuery,
    isPublicMode: false,
  });
});

export const ContractsWrapper = GetPublicModeWrapper<Props>(PublicContractsWrapper, PrivateContractsWrapper);

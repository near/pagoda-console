import type { Projects } from '@pc/common/types/core';
import { useQuery as useRawQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';

import { GetPublicModeWrapper } from '@/components/lib/PublicModeWrapper';
import { withSelectedProject } from '@/components/with-selected-project';
import type { UseQueryResult } from '@/hooks/query';
import { useQuery } from '@/hooks/query';
import { usePublicStore } from '@/stores/public';

type ChildrenProps = {
  contractQuery: UseQueryResult<'/projects/getContract'>;
  isPublicMode: boolean;
};

type Props = {
  slug: Projects.ContractSlug;
  children: (props: ChildrenProps) => ReactElement | null;
};

const PublicContractWrapper = ({ slug, children }: Props) => {
  const contracts = usePublicStore((store) => store.contracts);
  const contract = contracts.find((contract) => contract.slug === slug);
  const contractQuery = useRawQuery(['public-contracts'], () => {
    if (!contract) {
      throw new Error(`No contract found by slug ${slug}`);
    }
    return contract;
  });
  return children({
    contractQuery,
    isPublicMode: true,
  });
};

const PrivateContractWrapper = withSelectedProject(({ slug, children }: Props) => {
  const contractQuery = useQuery(['/projects/getContract', { slug }]);
  return children({ contractQuery, isPublicMode: false });
});

export const ContractWrapper = GetPublicModeWrapper<Props>(PublicContractWrapper, PrivateContractWrapper);

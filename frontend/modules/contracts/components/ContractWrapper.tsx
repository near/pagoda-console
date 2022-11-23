import type { Api } from '@pc/common/types/api';
import type { ReactElement } from 'react';

import { GetPublicModeWrapper } from '@/components/lib/PublicModeWrapper';
import { withSelectedProject } from '@/components/with-selected-project';
import { useContract } from '@/hooks/contracts';
import { usePublicStore } from '@/stores/public';

type Contract = Api.Query.Output<'/projects/getContract'>;

type ChildrenProps = {
  contract?: Contract;
  isPublicMode: boolean;
  error?: unknown;
};

type Props = {
  slug: string;
  children: (props: ChildrenProps) => ReactElement | null;
};

const PublicContractWrapper = ({ slug, children }: Props) => {
  const contracts = usePublicStore((store) => store.contracts);
  const contract = contracts.find((contract) => contract.slug === slug);
  return children({ contract, isPublicMode: true });
};

const PrivateContractWrapper = withSelectedProject(({ slug, children }: Props) => {
  const { contract, error } = useContract(slug);
  return children({ contract, error, isPublicMode: false });
});

export const ContractWrapper = GetPublicModeWrapper<Props>(PublicContractWrapper, PrivateContractWrapper);

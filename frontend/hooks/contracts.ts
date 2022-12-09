import type { Api } from '@pc/common/types/api';
import useSWR from 'swr';

import { useAuth } from '@/hooks/auth';
import { usePublicStore } from '@/stores/public';
import { fetchApi } from '@/utils/http';

type Contract = Api.Query.Output<'/projects/getContracts'>[number];

export function useContracts(project: string | undefined, environment: number | undefined) {
  const { data: contracts, error } = useSWR(
    project && environment ? ['/projects/getContracts' as const, project, environment] : null,
    (key, project, environment) => {
      return fetchApi([key, { project, environment }]);
    },
  );

  return { contracts, error };
}

export function useContract(slug: string | undefined) {
  const { identity } = useAuth();

  const {
    data: contract,
    error,
    mutate,
  } = useSWR(identity && slug ? ['/projects/getContract' as const, slug, identity.uid] : null, (key, slug) => {
    return fetchApi([key, { slug }]);
  });

  return { contract, error, mutate };
}

export function usePublicOrPrivateContract(slug: string | undefined) {
  const publicModeHasHydrated = usePublicStore((store) => store.hasHydrated);
  const publicModeIsActive = usePublicStore((store) => store.publicModeIsActive);
  const publicContracts = usePublicStore((store) => store.contracts);
  const { contract: privateContract, error } = useContract(
    publicModeHasHydrated && !publicModeIsActive ? slug : undefined,
  );
  const publicContract = publicContracts.find((c) => c.slug === slug);

  return {
    contract: publicModeIsActive ? publicContract : privateContract,
    error,
  };
}

export function usePublicOrPrivateContracts(privateContracts: Contract[] | undefined) {
  const publicModeIsActive = usePublicStore((store) => store.publicModeIsActive);
  const publicContracts = usePublicStore((store) => store.contracts);

  return {
    contracts: publicModeIsActive ? publicContracts : privateContracts,
  };
}

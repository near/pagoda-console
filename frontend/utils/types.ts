import type BN from 'bn.js';
import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};
export type NetOption = 'MAINNET' | 'TESTNET';
export type TutorialOption = 'NFT_MARKET' | 'CROSSWORD';

export interface PersistedStore {
  hasHydrated?: boolean;
}

export interface Contract {
  slug: string;
  address: string;
  environmentId: number;
  net: NetOption;
  active?: boolean;
}

export interface Project {
  id: number;
  name: string;
  slug: string;
  tutorial: TutorialOption;
  active?: boolean;
  org: {
    name?: string;
    slug: string;
    isPersonal: boolean;
  };
}

export type Organization = {
  slug: string;
  name: string;
  isPersonal: boolean;
};

export type OrganizationRole = 'ADMIN' | 'COLLABORATOR';

export type OrganizationMember = {
  role: OrganizationRole;
  orgSlug: string;
  user: {
    uid: string | null;
    email: string;
  };
  isInvite?: boolean;
};

export interface Environment {
  // id: number,
  name: string;
  subId: number;
  // projectId: number,
  net: NetOption;
  active?: boolean;
  project?: Project;
}

export interface User {
  uid: string;
  email: string;
  name?: string;
  photoUrl?: string;
}

export interface FinalityStatus {
  finalBlockHeight: number;
  finalBlockTimestampNanosecond: BN;
}

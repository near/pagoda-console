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
  net: NetOption;
}

export interface Project {
  id: number;
  name: string;
  slug: string;
  tutorial: TutorialOption;
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
  name: string;
  subId: number;
  net: NetOption;
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

export interface ViewAccount {
  id: string;
  jsonrpc: string;
  result: {
    amount: string;
    block_hash: string;
    block_height: number;
    code_hash: string;
    locked: string;
    storage_paid_at: number;
    storage_usage: number;
  };
}

import type JSBI from 'jsbi';
import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';

export type NextPageWithLayout<T> = NextPage<T> & {
  getLayout?: (page: ReactElement) => ReactNode;
};
export type TutorialOption = 'NFT_MARKET' | 'CROSSWORD';

export const netOptions = ['MAINNET', 'TESTNET'] as const;
export type NetOption = typeof netOptions[number];

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
  finalBlockTimestampNanosecond: JSBI;
}

export interface ApiKey {
  keySlug: string;
  description: string;
  key: string;
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

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
  id: number;
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
}

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

export interface UserData {
  projectData: Record<string, UserProjectData>;
  usageData: Record<string, UsageData>;
}

export interface UserProjectData {
  selectedEnvironment: number;
  nftContract?: string;
}

export interface UsageData {
  nets: Record<NetOption, NetUsageData>;
  fetchedAt: string;
}

export interface NetUsageData {
  methods: Record<string, number>;
  calls: number;
  responseCodes: Record<string, number>;
}

export interface FinalityStatus {
  finalBlockHeight: number;
  finalBlockTimestampNanosecond: BN;
}

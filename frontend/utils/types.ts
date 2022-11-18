import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export type MapDiscriminatedUnion<T extends Record<K, string>, K extends keyof T> = {
  [V in T[K]]: Extract<T, Record<K, V>>;
};

export const netOptions = ['MAINNET', 'TESTNET'] as const;
export type NetOption = typeof netOptions[number];

export interface PersistedStore {
  hasHydrated?: boolean;
}

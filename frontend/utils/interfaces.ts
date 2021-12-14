export type NetOption = 'MAINNET' | 'TESTNET';

export interface Contract {
    id: number,
    address: string,
    environmentId: number,
    net: NetOption,
    active?: boolean
}

export interface Project {
    id: number,
    name: string,
    slug: string,
    active?: boolean
}

export interface Environment {
    // id: number,
    name: string,
    subId: number;
    // projectId: number,
    net: NetOption,
    active?: boolean,
    project?: Project
}

export interface User {
    uid: string,
    email: string,
    name?: string,
    photoUrl?: string,
}

export interface UsageData {
    methods: Record<string, number>,
    calls: number,
    responseCodes: Record<string, number>,
    fetchedAt: string
}
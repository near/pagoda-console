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

export interface UserData {
    selectedEnvironments: Record<string, number>,
    usageData: Record<string, UsageData>
}

export interface UsageData {
    nets: Record<NetOption, NetUsageData>
    fetchedAt: string
}

export interface NetUsageData {
    methods: Record<string, number>,
    calls: number,
    responseCodes: Record<string, number>,
}
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
    active?: boolean
}

export interface Environment {
    id: number,
    name?: string,
    projectId: number,
    net: NetOption,
    active?: boolean
}
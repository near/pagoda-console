import type { Projects } from '@pc/common/types/core';

export interface ContractTemplate {
  abiFileUrl: string;
  detailSummary: string;
  image: string;
  instructions: string;
  isEnabled: boolean;
  listSummary: string;
  repositoryUrl: string;
  slug: string;
  title: string;
  wasmFileUrl: string;
}

const contractTemplates: ContractTemplate[] = [
  {
    abiFileUrl: '/contract-templates/non_fungible_token_abi.json',
    detailSummary:
      'Trigger methods to mint, transfer tokens, check access, and get the token owner. One-click deploy your contract to a development account and explore it within a new project.',
    image: '/images/contract-templates/nft.png',
    instructions: 'One-click deploy your contract to a development account and explore it within a new project.',
    isEnabled: true,
    listSummary: 'Deploy a non-fungible token contract and mint an NFT using contract triggers.',
    repositoryUrl: 'https://github.com/near-examples/NFT/tree/console',
    slug: 'non-fungible-token',
    title: 'Non-fungible Token (NFT)',
    wasmFileUrl: '/contract-templates/non_fungible_token.wasm',
  },
  {
    abiFileUrl: '',
    detailSummary: '',
    image: '/images/contract-templates/ft.png',
    instructions: '',
    isEnabled: false,
    listSummary: 'Deploy a Fungible Token contract and mint a token using contract triggers.',
    repositoryUrl: '',
    slug: 'fungible-token',
    title: 'Fungible Token (FT)',
    wasmFileUrl: '',
  },
  {
    abiFileUrl: '',
    detailSummary: '',
    image: '/images/contract-templates/guestbook.png',
    instructions: '',
    isEnabled: false,
    listSummary: 'Sign in with NEAR and add a message to the Guest Book.',
    repositoryUrl: '',
    slug: 'guest-book',
    title: 'Guest Book',
    wasmFileUrl: '',
  },
];

export function useContractTemplates() {
  return contractTemplates;
}

export function useContractTemplate(slug?: Projects.ContractSlug | null) {
  return contractTemplates.find((template) => template.slug === slug);
}

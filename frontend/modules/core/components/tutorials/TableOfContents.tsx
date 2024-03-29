import Link from 'next/link';
import { useRouter } from 'next/router';

import { Box } from '@/components/lib/Box';
import { Flex } from '@/components/lib/Flex';
import { TextLink } from '@/components/lib/TextLink';
import { StableId } from '@/utils/stable-ids';

interface Route {
  label: string;
  path: string;
  children?: Route[];
}

const BASE_PATH = '/tutorials/nfts';
const ROUTES: Route[] = [
  {
    label: 'Overview',
    path: '/introduction',
    children: [
      {
        label: 'Prerequisites',
        path: '#prerequisites',
      },
      {
        label: 'Overview',
        path: '#overview',
      },
      {
        label: 'Next steps',
        path: '#next-steps',
      },
    ],
  },
  {
    label: '1. Pre-deployed Contract',
    path: '/predeployed-contract',
    children: [
      {
        label: 'Prerequisites',
        path: '#prerequisites',
      },
      {
        label: 'Using the NFT contract',
        path: '#using-the-nft-contract',
        children: [
          {
            label: 'Setup',
            path: '#setup',
          },
          {
            label: 'Minting your NFTs',
            path: '#minting-your-nfts',
          },
        ],
      },
      {
        label: 'Final remarks',
        path: '#final-remarks',
      },
    ],
  },
  {
    label: '2. Contract Architecture',
    path: '/skeleton',
    children: [
      {
        label: 'Introduction',
        path: '#introduction',
      },
      {
        label: 'File structure',
        path: '#file-structure',
        children: [
          {
            label: 'Source files',
            path: '#source-files',
          },
        ],
      },
      {
        label: 'approval.rs',
        path: '#approvalrs',
      },
      {
        label: 'enumeration.rs',
        path: '#enumerationrs',
      },
      {
        label: 'lib.rs',
        path: '#librs',
      },
      {
        label: 'metadata.rs',
        path: '#metadatars',
      },
      {
        label: 'mint.rs',
        path: '#mintrs',
      },
      {
        label: 'nft_core.rs',
        path: '#nft_corers',
      },
      {
        label: 'royalty.rs',
        path: '#royaltyrs',
      },
      {
        label: 'Building the skeleton',
        path: '#building-the-skeleton',
      },
      {
        label: 'Conclusion',
        path: '#conclusion',
      },
    ],
  },
  {
    label: '3. Minting',
    path: '/minting',
    children: [
      {
        label: 'Introduction',
        path: '#introduction',
      },
      {
        label: 'Modifications to the skeleton contract',
        path: '#modifications-to-the-skeleton-contract',
        children: [
          {
            label: 'Storing information on the contract',
            path: '#storing-information-on-the-contract',
          },
          {
            label: 'Metadata and token information',
            path: '#metadata-and-token-information',
          },
          {
            label: 'Minting logic',
            path: '#minting-logic',
          },
          {
            label: 'Querying for token information',
            path: '#querying-for-token-information',
          },
        ],
      },
      {
        label: 'Interacting with the contract on-chain',
        path: '#interacting-with-the-contract-on-chain',
        children: [
          {
            label: 'Deploying the contract',
            path: '#deploying-the-contract',
          },
          {
            label: 'Initializing the contract',
            path: '#initializing-the-contract',
          },
          {
            label: "Viewing the contract's metadata",
            path: '#viewing-the-contracts-metadata',
          },
          {
            label: 'Minting our first NFT',
            path: '#minting-our-first-nft',
          },
          {
            label: 'Viewing information about the NFT',
            path: '#viewing-information-about-the-nft',
          },
        ],
      },
      {
        label: 'Viewing your NFTs in the wallet',
        path: '#viewing-your-nfts-in-the-wallet',
      },
      {
        label: 'Conclusion',
        path: '#conclusion',
      },
      {
        label: 'Next steps',
        path: '#next-steps',
      },
    ],
  },
  {
    label: '4. Upgrade a Contract',
    path: '/upgrade-contract',
    children: [
      {
        label: 'Introduction',
        path: '#introduction',
      },
      {
        label: 'Upgrading contracts overview',
        path: '#upgrading-contracts-overview',
      },
      {
        label: 'Modifications to our contract',
        path: '#modifications-to-our-contract',
      },
      {
        label: 'Redeploying the contract',
        path: '#redeploying-the-contract',
      },
      {
        label: 'Viewing NFTs in the wallet',
        path: '#viewing-nfts-in-the-wallet',
      },
      {
        label: 'Conclusion',
        path: '#conclusion',
      },
    ],
  },
  {
    label: '5. Enumeration',
    path: '/enumeration',
    children: [
      {
        label: 'Introduction',
        path: '#introduction',
      },
      {
        label: 'Modifications to the contract',
        path: '#modifications-to-the-contract',
      },
      {
        label: 'Redeploying the contract',
        path: '#redeploying-the-contract',
      },
      {
        label: 'Enumerating tokens',
        path: '#enumerating-tokens',
        children: [
          {
            label: 'NFT tokens',
            path: '#nft-tokens',
          },
          {
            label: 'Tokens by owner',
            path: '#tokens-by-owner',
          },
        ],
      },
      {
        label: 'Conclusion',
        path: '#conclusion',
      },
    ],
  },
  {
    label: '6. Core',
    path: '/core',
    children: [
      {
        label: 'Introduction',
        path: '#introduction',
      },
      {
        label: 'Modifications to the contract',
        path: '#modifications-to-the-contract',
        children: [
          {
            label: 'Transfer function',
            path: '#transfer-function',
          },
          {
            label: 'Internal helper functions',
            path: '#internal-helper-functions',
          },
          {
            label: 'Transfer call function',
            path: '#transfer-call-function',
          },
        ],
      },
      {
        label: 'Redeploying the contract',
        path: '#redeploying-the-contract',
      },
      {
        label: 'Testing the new changes',
        path: '#testing-the-new-changes',
        children: [
          {
            label: 'Testing the transfer function',
            path: '#testing-the-transfer-function',
          },
          {
            label: 'Testing the transfer call function',
            path: '#testing-the-transfer-call-function',
          },
        ],
      },
      {
        label: 'Conclusion',
        path: '#conclusion',
      },
    ],
  },
  {
    label: '7. Approvals',
    path: '/approvals',
    children: [
      {
        label: 'Introduction',
        path: '#introduction',
      },
      {
        label: 'Allow an account to transfer your NFT',
        path: '#allow-an-account-to-transfer-your-nft',
        children: [
          {
            label: 'The problem',
            path: '#the-problem',
          },
          {
            label: 'The solution',
            path: '#the-solution',
          },
          {
            label: 'Expanding the Token and JsonToken structs',
            path: '#expanding-the-token-and-jsontoken-structs',
          },
          {
            label: 'Approving accounts',
            path: '#approving-accounts',
          },
          {
            label: 'Changing the restrictions for transferring NFTs',
            path: '#changing-the-restrictions-for-transferring-nfts',
          },
          {
            label: 'Changes to nft_core.rs',
            path: '#changes-to-nft_corers',
          },
        ],
      },
      {
        label: 'Check if an account is approved',
        path: '#check-if-an-account-is-approved',
      },
      {
        label: 'Revoke an account',
        path: '#revoke-an-account',
      },
      {
        label: 'Revoke all accounts',
        path: '#revoke-all-accounts',
      },
      {
        label: 'Testing the new changes',
        path: '#testing-the-new-changes',
        children: [
          {
            label: 'Creating a sub-account',
            path: '#creating-a-sub-account',
          },
          {
            label: 'Initialization and minting',
            path: '#initialization-and-minting',
          },
          {
            label: 'Approving an account',
            path: '#approving-an-account',
          },
          {
            label: 'Transferring an NFT as an approved account',
            path: '#transferring-an-nft-as-an-approved-account',
          },
        ],
      },
      {
        label: 'Conclusion',
        path: '#conclusion',
      },
    ],
  },
  {
    label: '8. Royalty',
    path: '/royalty',
    children: [
      {
        label: 'Introduction',
        path: '#introduction',
      },
      {
        label: 'Thinking about the problem',
        path: '#thinking-about-the-problem',
        children: [
          {
            label: 'Expanding the current solution',
            path: '#expanding-the-current-solution',
          },
        ],
      },
      {
        label: 'Modifications to the contract',
        path: '#modifications-to-the-contract',
        children: [
          {
            label: 'Internal helper function',
            path: '#internal-helper-function',
          },
          {
            label: 'Royalties',
            path: '#royalties',
          },
          {
            label: 'Perpetual royalties',
            path: '#perpetual-royalties',
          },
          {
            label: 'Adding royalty object to struct implementations',
            path: '#adding-royalty-object-to-struct-implementations',
          },
        ],
      },
      {
        label: 'Deploying the contract',
        path: '#deploying-the-contract',
        children: [
          {
            label: 'Creating a sub-account',
            path: '#creating-a-sub-account',
          },
          {
            label: 'Initialization and minting',
            path: '#initialization-and-minting',
          },
          {
            label: 'NFT payout',
            path: '#nft-payout',
          },
        ],
      },
      {
        label: 'Conclusion',
        path: '#conclusion',
      },
    ],
  },
  {
    label: '9. Events',
    path: '/events',
    children: [
      {
        label: 'Introduction',
        path: '#introduction',
      },
      {
        label: 'Understanding the use case',
        path: '#understanding-the-use-case',
        children: [
          {
            label: 'The problem',
            path: '#the-problem',
          },
          {
            label: 'The solution',
            path: '#the-solution',
          },
          {
            label: 'Examples',
            path: '#examples',
          },
        ],
      },
      {
        label: 'Modifications to the contract',
        path: '#modifications-to-the-contract',
        children: [
          {
            label: 'Creating the events file',
            path: '#creating-the-events-file',
          },
          {
            label: 'Adding modules and constants',
            path: '#adding-modules-and-constants',
          },
          {
            label: 'Logging minted tokens',
            path: '#logging-minted-tokens',
          },
          {
            label: 'Logging transfers',
            path: '#logging-transfers',
          },
        ],
      },
      {
        label: 'Deploying the contract',
        path: '#deploying-the-contract',
        children: [
          {
            label: 'Creating a sub-account',
            path: '#creating-a-sub-account',
          },
          {
            label: 'Initialization and minting',
            path: '#initialization-and-minting',
          },
          {
            label: 'Transferring',
            path: '#transferring',
          },
        ],
      },
      {
        label: 'Conclusion',
        path: '#conclusion',
      },
    ],
  },
  {
    label: '10. Marketplace',
    path: '/marketplace',
    children: [
      {
        label: 'Introduction',
        path: '#introduction',
      },
      {
        label: 'File structure',
        path: '#file-structure',
      },
      {
        label: 'Understanding the contract',
        path: '#understanding-the-contract',
      },
      {
        label: 'lib.rs',
        path: '#librs',
        children: [
          {
            label: 'Initialization function',
            path: '#initialization-function',
          },
          {
            label: 'Storage management model',
            path: '#storage-management-model',
          },
        ],
      },
      {
        label: 'nft_callbacks.rs',
        path: '#nft_callbacksrs',
        children: [
          {
            label: 'Listing logic',
            path: '#listing-logic',
          },
        ],
      },
      {
        label: 'sale.rs',
        path: '#salers',
        children: [
          {
            label: 'Sale object',
            path: '#sale-object',
          },
          {
            label: 'Removing sales',
            path: '#removing-sales',
          },
          {
            label: 'Updating price',
            path: '#updating-price',
          },
          {
            label: 'Purchasing NFTs',
            path: '#purchasing-nfts',
          },
        ],
      },
      {
        label: 'sale_view.rs',
        path: '#sale_viewrs',
        children: [
          {
            label: 'Total supply',
            path: '#total-supply',
          },
          {
            label: 'Total supply by owner',
            path: '#total-supply-by-owner',
          },
          {
            label: 'Total supply by contract',
            path: '#total-supply-by-contract',
          },
          {
            label: 'Query for listing information',
            path: '#query-for-listing-information',
          },
        ],
      },
      {
        label: 'Conclusion',
        path: '#conclusion',
      },
    ],
  },
];

// Top-level links are not children but every link under the top-level is considered a child link.
function RouteList({ routes, isChild = false }: { routes: Route[]; isChild?: boolean }) {
  return (
    <Box
      as="ul"
      css={{
        paddingLeft: isChild ? 'var(--space-m)' : '0',
      }}
    >
      {routes.map((route) => (
        <RouteItem key={route.path} route={route} isChild={isChild} />
      ))}
    </Box>
  );
}

function RouteItem({ route, isChild }: { route: Route; isChild: boolean }) {
  const router = useRouter();
  let path;
  if (route.path.startsWith('#')) {
    path = route.path;
  } else {
    path = `${BASE_PATH}${route.path}`;
  }

  const isCurrentRoute = router.pathname.startsWith(`${BASE_PATH}${route.path}`);

  return (
    <Box
      as="li"
      css={{
        lineHeight: 1.2,
      }}
    >
      {path.startsWith('#') && (
        <TextLink
          stableId={StableId.TUTORIAL_CONTENT_TABLE_OF_CONTENTS_LINK}
          href={path}
          css={{ fontWeight: 400, border: 'none', whiteSpace: 'pre-line', padding: 'var(--space-xs) 0' }}
        >
          {route.label}
        </TextLink>
      )}
      {!path.startsWith('#') && (
        <Link href={path} passHref>
          <TextLink
            stableId={StableId.TUTORIAL_CONTENT_TABLE_OF_CONTENTS_LINK}
            color="neutral"
            css={{ fontWeight: 400, border: 'none', whiteSpace: 'pre-line', padding: 'var(--space-xs) 0' }}
          >
            {route.label}
          </TextLink>
        </Link>
      )}
      {(isCurrentRoute || isChild) && route.children && <RouteList routes={route.children} isChild={true} />}
    </Box>
  );
}

// TODO make this component dynamic based on tutorial project
export default function TableOfContents() {
  return (
    <Box
      css={{
        width: '28rem',
        maxHeight: 'calc(100vh - calc(var(--size-header-height) + var(--space-l)))',
        position: 'sticky',
        top: 'calc(var(--size-header-height) + var(--space-l))',
        borderLeft: '1px solid var(--color-border-1)',
        paddingLeft: 'var(--space-l)',
        overflowY: 'auto',
        scrollBehavior: 'smooth',

        '@media (max-width: 1280px)': {
          display: 'none',
        },
      }}
    >
      <Flex stack>
        <RouteList routes={ROUTES} />
      </Flex>
    </Box>
  );
}

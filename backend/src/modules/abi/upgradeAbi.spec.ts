import { upgradeAbi } from '@pc/abi/upgrade';

const HELLO_NEAR_V_0_1_0 = {
  schema_version: '0.1.0',
  metadata: {
    name: 'hello_near',
    version: '1.0.0',
    authors: ['Near Inc <hello@near.org>'],
  },
  body: {
    functions: [
      {
        name: 'get_greeting',
        is_view: true,
        result: {
          serialization_type: 'json',
          type_schema: {
            type: 'string',
          },
        },
      },
      {
        name: 'set_greeting',
        params: [
          {
            name: 'message',
            serialization_type: 'json',
            type_schema: {
              type: 'string',
            },
          },
        ],
      },
    ],
    root_schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'String',
      type: 'string',
    },
  },
};

const HELLO_NEAR_V_0_3_0 = {
  schema_version: '0.3.0',
  metadata: {
    name: 'hello_near',
    version: '1.0.0',
    authors: ['Near Inc <hello@near.org>'],
  },
  body: {
    functions: [
      {
        name: 'get_greeting',
        kind: 'view',
        result: {
          serialization_type: 'json',
          type_schema: {
            type: 'string',
          },
        },
      },
      {
        name: 'set_greeting',
        kind: 'call',
        params: {
          serialization_type: 'json',
          args: [
            {
              name: 'message',
              type_schema: {
                type: 'string',
              },
            },
          ],
        },
      },
    ],
    root_schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'String',
      type: 'string',
    },
  },
};

const NFT_NEAR_V_0_1_0 = {
  body: {
    functions: [
      {
        name: 'new',
        params: [
          {
            name: 'owner_id',
            type_schema: {
              $ref: '#/definitions/AccountId',
            },
            serialization_type: 'json',
          },
          {
            name: 'metadata',
            type_schema: {
              $ref: '#/definitions/NFTContractMetadata',
            },
            serialization_type: 'json',
          },
        ],
        is_init: true,
      },
      {
        name: 'new_default_meta',
        params: [
          {
            name: 'owner_id',
            type_schema: {
              $ref: '#/definitions/AccountId',
            },
            serialization_type: 'json',
          },
        ],
        is_init: true,
      },
      {
        name: 'nft_approve',
        params: [
          {
            name: 'token_id',
            type_schema: {
              type: 'string',
            },
            serialization_type: 'json',
          },
          {
            name: 'account_id',
            type_schema: {
              $ref: '#/definitions/AccountId',
            },
            serialization_type: 'json',
          },
          {
            name: 'msg',
            type_schema: {
              type: ['string', 'null'],
            },
            serialization_type: 'json',
          },
        ],
        result: {
          type_schema: {
            anyOf: [
              {
                $ref: '#/definitions/Promise',
              },
              {
                type: 'null',
              },
            ],
          },
          serialization_type: 'json',
        },
        is_payable: true,
      },
      {
        name: 'nft_is_approved',
        params: [
          {
            name: 'token_id',
            type_schema: {
              type: 'string',
            },
            serialization_type: 'json',
          },
          {
            name: 'approved_account_id',
            type_schema: {
              $ref: '#/definitions/AccountId',
            },
            serialization_type: 'json',
          },
          {
            name: 'approval_id',
            type_schema: {
              type: ['integer', 'null'],
              format: 'uint64',
              minimum: 0,
            },
            serialization_type: 'json',
          },
        ],
        result: {
          type_schema: {
            type: 'boolean',
          },
          serialization_type: 'json',
        },
        is_view: true,
      },
      {
        name: 'nft_metadata',
        result: {
          type_schema: {
            $ref: '#/definitions/NFTContractMetadata',
          },
          serialization_type: 'json',
        },
        is_view: true,
      },
      {
        name: 'nft_mint',
        params: [
          {
            name: 'token_id',
            type_schema: {
              type: 'string',
            },
            serialization_type: 'json',
          },
          {
            name: 'receiver_id',
            type_schema: {
              $ref: '#/definitions/AccountId',
            },
            serialization_type: 'json',
          },
          {
            name: 'token_metadata',
            type_schema: {
              $ref: '#/definitions/TokenMetadata',
            },
            serialization_type: 'json',
          },
        ],
        result: {
          type_schema: {
            $ref: '#/definitions/Token',
          },
          serialization_type: 'json',
        },
        is_payable: true,
      },
      {
        name: 'nft_resolve_transfer',
        params: [
          {
            name: 'previous_owner_id',
            type_schema: {
              $ref: '#/definitions/AccountId',
            },
            serialization_type: 'json',
          },
          {
            name: 'receiver_id',
            type_schema: {
              $ref: '#/definitions/AccountId',
            },
            serialization_type: 'json',
          },
          {
            name: 'token_id',
            type_schema: {
              type: 'string',
            },
            serialization_type: 'json',
          },
          {
            name: 'approved_account_ids',
            type_schema: {
              type: ['object', 'null'],
              additionalProperties: {
                type: 'integer',
                format: 'uint64',
                minimum: 0,
              },
            },
            serialization_type: 'json',
          },
        ],
        result: {
          type_schema: {
            type: 'boolean',
          },
          serialization_type: 'json',
        },
        is_private: true,
      },
      {
        name: 'nft_revoke',
        params: [
          {
            name: 'token_id',
            type_schema: {
              type: 'string',
            },
            serialization_type: 'json',
          },
          {
            name: 'account_id',
            type_schema: {
              $ref: '#/definitions/AccountId',
            },
            serialization_type: 'json',
          },
        ],
        is_payable: true,
      },
      {
        name: 'nft_revoke_all',
        params: [
          {
            name: 'token_id',
            type_schema: {
              type: 'string',
            },
            serialization_type: 'json',
          },
        ],
        is_payable: true,
      },
      {
        name: 'nft_supply_for_owner',
        params: [
          {
            name: 'account_id',
            type_schema: {
              $ref: '#/definitions/AccountId',
            },
            serialization_type: 'json',
          },
        ],
        result: {
          type_schema: {
            $ref: '#/definitions/U128',
          },
          serialization_type: 'json',
        },
        is_view: true,
      },
      {
        name: 'nft_token',
        params: [
          {
            name: 'token_id',
            type_schema: {
              type: 'string',
            },
            serialization_type: 'json',
          },
        ],
        result: {
          type_schema: {
            anyOf: [
              {
                $ref: '#/definitions/Token',
              },
              {
                type: 'null',
              },
            ],
          },
          serialization_type: 'json',
        },
        is_view: true,
      },
      {
        name: 'nft_tokens',
        params: [
          {
            name: 'from_index',
            type_schema: {
              anyOf: [
                {
                  $ref: '#/definitions/U128',
                },
                {
                  type: 'null',
                },
              ],
            },
            serialization_type: 'json',
          },
          {
            name: 'limit',
            type_schema: {
              type: ['integer', 'null'],
              format: 'uint64',
              minimum: 0,
            },
            serialization_type: 'json',
          },
        ],
        result: {
          type_schema: {
            type: 'array',
            items: {
              $ref: '#/definitions/Token',
            },
          },
          serialization_type: 'json',
        },
        is_view: true,
      },
      {
        name: 'nft_tokens_for_owner',
        params: [
          {
            name: 'account_id',
            type_schema: {
              $ref: '#/definitions/AccountId',
            },
            serialization_type: 'json',
          },
          {
            name: 'from_index',
            type_schema: {
              anyOf: [
                {
                  $ref: '#/definitions/U128',
                },
                {
                  type: 'null',
                },
              ],
            },
            serialization_type: 'json',
          },
          {
            name: 'limit',
            type_schema: {
              type: ['integer', 'null'],
              format: 'uint64',
              minimum: 0,
            },
            serialization_type: 'json',
          },
        ],
        result: {
          type_schema: {
            type: 'array',
            items: {
              $ref: '#/definitions/Token',
            },
          },
          serialization_type: 'json',
        },
        is_view: true,
      },
      {
        name: 'nft_total_supply',
        result: {
          type_schema: {
            $ref: '#/definitions/U128',
          },
          serialization_type: 'json',
        },
        is_view: true,
      },
      {
        name: 'nft_transfer',
        params: [
          {
            name: 'receiver_id',
            type_schema: {
              $ref: '#/definitions/AccountId',
            },
            serialization_type: 'json',
          },
          {
            name: 'token_id',
            type_schema: {
              type: 'string',
            },
            serialization_type: 'json',
          },
          {
            name: 'approval_id',
            type_schema: {
              type: ['integer', 'null'],
              format: 'uint64',
              minimum: 0,
            },
            serialization_type: 'json',
          },
          {
            name: 'memo',
            type_schema: {
              type: ['string', 'null'],
            },
            serialization_type: 'json',
          },
        ],
        is_payable: true,
      },
      {
        name: 'nft_transfer_call',
        params: [
          {
            name: 'receiver_id',
            type_schema: {
              $ref: '#/definitions/AccountId',
            },
            serialization_type: 'json',
          },
          {
            name: 'token_id',
            type_schema: {
              type: 'string',
            },
            serialization_type: 'json',
          },
          {
            name: 'approval_id',
            type_schema: {
              type: ['integer', 'null'],
              format: 'uint64',
              minimum: 0,
            },
            serialization_type: 'json',
          },
          {
            name: 'memo',
            type_schema: {
              type: ['string', 'null'],
            },
            serialization_type: 'json',
          },
          {
            name: 'msg',
            type_schema: {
              type: 'string',
            },
            serialization_type: 'json',
          },
        ],
        result: {
          type_schema: {
            $ref: '#/definitions/PromiseOrValueBoolean',
          },
          serialization_type: 'json',
        },
        is_payable: true,
      },
    ],
    root_schema: {
      type: 'string',
      title: 'String',
      $schema: 'http://json-schema.org/draft-07/schema#',
    },
  },
  metadata: {
    name: 'non-fungible-token',
    authors: ['Near Inc <hello@near.org>'],
    version: '1.1.0',
  },
  schema_version: '0.1.0',
};

const NFT_NEAR_V_0_3_0 = {
  schema_version: '0.3.0',
  metadata: {
    name: 'non-fungible-token',
    version: '1.1.0',
    authors: ['Near Inc <hello@near.org>'],
  },
  body: {
    functions: [
      {
        name: 'new',
        kind: 'call',
        modifiers: ['init'],
        params: {
          serialization_type: 'json',
          args: [
            {
              name: 'owner_id',
              type_schema: {
                $ref: '#/definitions/AccountId',
              },
            },
            {
              name: 'metadata',
              type_schema: {
                $ref: '#/definitions/NFTContractMetadata',
              },
            },
          ],
        },
      },
      {
        name: 'new_default_meta',
        kind: 'call',
        modifiers: ['init'],
        params: {
          serialization_type: 'json',
          args: [
            {
              name: 'owner_id',
              type_schema: {
                $ref: '#/definitions/AccountId',
              },
            },
          ],
        },
      },
      {
        name: 'nft_approve',
        kind: 'call',
        modifiers: ['payable'],
        params: {
          serialization_type: 'json',
          args: [
            {
              name: 'token_id',
              type_schema: {
                type: 'string',
              },
            },
            {
              name: 'account_id',
              type_schema: {
                $ref: '#/definitions/AccountId',
              },
            },
            {
              name: 'msg',
              type_schema: {
                type: ['string', 'null'],
              },
            },
          ],
        },
        result: {
          serialization_type: 'json',
          type_schema: {
            anyOf: [
              {
                $ref: '#/definitions/Promise',
              },
              {
                type: 'null',
              },
            ],
          },
        },
      },
      {
        name: 'nft_is_approved',
        kind: 'view',
        params: {
          serialization_type: 'json',
          args: [
            {
              name: 'token_id',
              type_schema: {
                type: 'string',
              },
            },
            {
              name: 'approved_account_id',
              type_schema: {
                $ref: '#/definitions/AccountId',
              },
            },
            {
              name: 'approval_id',
              type_schema: {
                type: ['integer', 'null'],
                format: 'uint64',
                minimum: 0.0,
              },
            },
          ],
        },
        result: {
          serialization_type: 'json',
          type_schema: {
            type: 'boolean',
          },
        },
      },
      {
        name: 'nft_metadata',
        kind: 'view',
        result: {
          serialization_type: 'json',
          type_schema: {
            $ref: '#/definitions/NFTContractMetadata',
          },
        },
      },
      {
        name: 'nft_mint',
        kind: 'call',
        modifiers: ['payable'],
        params: {
          serialization_type: 'json',
          args: [
            {
              name: 'token_id',
              type_schema: {
                type: 'string',
              },
            },
            {
              name: 'receiver_id',
              type_schema: {
                $ref: '#/definitions/AccountId',
              },
            },
            {
              name: 'token_metadata',
              type_schema: {
                $ref: '#/definitions/TokenMetadata',
              },
            },
          ],
        },
        result: {
          serialization_type: 'json',
          type_schema: {
            $ref: '#/definitions/Token',
          },
        },
      },
      {
        name: 'nft_resolve_transfer',
        kind: 'call',
        modifiers: ['private'],
        params: {
          serialization_type: 'json',
          args: [
            {
              name: 'previous_owner_id',
              type_schema: {
                $ref: '#/definitions/AccountId',
              },
            },
            {
              name: 'receiver_id',
              type_schema: {
                $ref: '#/definitions/AccountId',
              },
            },
            {
              name: 'token_id',
              type_schema: {
                type: 'string',
              },
            },
            {
              name: 'approved_account_ids',
              type_schema: {
                type: ['object', 'null'],
                additionalProperties: {
                  type: 'integer',
                  format: 'uint64',
                  minimum: 0.0,
                },
              },
            },
          ],
        },
        result: {
          serialization_type: 'json',
          type_schema: {
            type: 'boolean',
          },
        },
      },
      {
        name: 'nft_revoke',
        kind: 'call',
        modifiers: ['payable'],
        params: {
          serialization_type: 'json',
          args: [
            {
              name: 'token_id',
              type_schema: {
                type: 'string',
              },
            },
            {
              name: 'account_id',
              type_schema: {
                $ref: '#/definitions/AccountId',
              },
            },
          ],
        },
      },
      {
        name: 'nft_revoke_all',
        kind: 'call',
        modifiers: ['payable'],
        params: {
          serialization_type: 'json',
          args: [
            {
              name: 'token_id',
              type_schema: {
                type: 'string',
              },
            },
          ],
        },
      },
      {
        name: 'nft_supply_for_owner',
        kind: 'view',
        params: {
          serialization_type: 'json',
          args: [
            {
              name: 'account_id',
              type_schema: {
                $ref: '#/definitions/AccountId',
              },
            },
          ],
        },
        result: {
          serialization_type: 'json',
          type_schema: {
            $ref: '#/definitions/U128',
          },
        },
      },
      {
        name: 'nft_token',
        kind: 'view',
        params: {
          serialization_type: 'json',
          args: [
            {
              name: 'token_id',
              type_schema: {
                type: 'string',
              },
            },
          ],
        },
        result: {
          serialization_type: 'json',
          type_schema: {
            anyOf: [
              {
                $ref: '#/definitions/Token',
              },
              {
                type: 'null',
              },
            ],
          },
        },
      },
      {
        name: 'nft_tokens',
        kind: 'view',
        params: {
          serialization_type: 'json',
          args: [
            {
              name: 'from_index',
              type_schema: {
                anyOf: [
                  {
                    $ref: '#/definitions/U128',
                  },
                  {
                    type: 'null',
                  },
                ],
              },
            },
            {
              name: 'limit',
              type_schema: {
                type: ['integer', 'null'],
                format: 'uint64',
                minimum: 0.0,
              },
            },
          ],
        },
        result: {
          serialization_type: 'json',
          type_schema: {
            type: 'array',
            items: {
              $ref: '#/definitions/Token',
            },
          },
        },
      },
      {
        name: 'nft_tokens_for_owner',
        kind: 'view',
        params: {
          serialization_type: 'json',
          args: [
            {
              name: 'account_id',
              type_schema: {
                $ref: '#/definitions/AccountId',
              },
            },
            {
              name: 'from_index',
              type_schema: {
                anyOf: [
                  {
                    $ref: '#/definitions/U128',
                  },
                  {
                    type: 'null',
                  },
                ],
              },
            },
            {
              name: 'limit',
              type_schema: {
                type: ['integer', 'null'],
                format: 'uint64',
                minimum: 0.0,
              },
            },
          ],
        },
        result: {
          serialization_type: 'json',
          type_schema: {
            type: 'array',
            items: {
              $ref: '#/definitions/Token',
            },
          },
        },
      },
      {
        name: 'nft_total_supply',
        kind: 'view',
        result: {
          serialization_type: 'json',
          type_schema: {
            $ref: '#/definitions/U128',
          },
        },
      },
      {
        name: 'nft_transfer',
        kind: 'call',
        modifiers: ['payable'],
        params: {
          serialization_type: 'json',
          args: [
            {
              name: 'receiver_id',
              type_schema: {
                $ref: '#/definitions/AccountId',
              },
            },
            {
              name: 'token_id',
              type_schema: {
                type: 'string',
              },
            },
            {
              name: 'approval_id',
              type_schema: {
                type: ['integer', 'null'],
                format: 'uint64',
                minimum: 0.0,
              },
            },
            {
              name: 'memo',
              type_schema: {
                type: ['string', 'null'],
              },
            },
          ],
        },
      },
      {
        name: 'nft_transfer_call',
        kind: 'call',
        modifiers: ['payable'],
        params: {
          serialization_type: 'json',
          args: [
            {
              name: 'receiver_id',
              type_schema: {
                $ref: '#/definitions/AccountId',
              },
            },
            {
              name: 'token_id',
              type_schema: {
                type: 'string',
              },
            },
            {
              name: 'approval_id',
              type_schema: {
                type: ['integer', 'null'],
                format: 'uint64',
                minimum: 0.0,
              },
            },
            {
              name: 'memo',
              type_schema: {
                type: ['string', 'null'],
              },
            },
            {
              name: 'msg',
              type_schema: {
                type: 'string',
              },
            },
          ],
        },
        result: {
          serialization_type: 'json',
          type_schema: {
            $ref: '#/definitions/PromiseOrValueBoolean',
          },
        },
      },
    ],
    root_schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'String',
      type: 'string',
    },
  },
};

test.each([
  [HELLO_NEAR_V_0_1_0, HELLO_NEAR_V_0_3_0],
  [NFT_NEAR_V_0_1_0, NFT_NEAR_V_0_3_0],
])('should upgrade ABI correctly', (input, expected) => {
  expect(upgradeAbi(input)).toStrictEqual(expected);
});

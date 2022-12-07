import {
  AbiRoot,
  AbiFunctionKind,
  AbiFunctionModifier,
  AbiSerializationType,
  AbiFunction,
} from 'near-abi-client-js';

import { AbiRoot as AbiRootV1, AbiType as AbiTypeV1 } from './abi.v1';

// ABI client v0.3.0 is not backwards compatible with version v0.1.0 and
// so all v0.1.0 on-chain and in our DB will need to be upgraded
// to at least v0.3.0.
// Newer ABI clients should be backwards compatible with version v0.3.0.
export function upgradeAbi(anyAbi: AbiRootV1 | AbiRoot | any): {
  upgraded: boolean;
  abiRoot: AbiRoot;
} {
  if (anyAbi?.schema_version === '0.3.0')
    return { upgraded: false, abiRoot: anyAbi as AbiRoot };
  if (anyAbi?.schema_version !== '0.1.0')
    throw 'ABI schema version not supported';

  const abi = anyAbi as AbiRootV1;

  let upgradedAbi: AbiRoot = {
    schema_version: '0.3.0',
    body: {
      root_schema: abi.body.root_schema,
      functions: abi.body.functions.map((func) => {
        let upgradedFunc: AbiFunction = {
          name: func.name,
          kind: func.is_view ? AbiFunctionKind.View : AbiFunctionKind.Call,
        };

        let modifiers: AbiFunctionModifier[] = [];

        if (func.is_init) {
          modifiers.push(AbiFunctionModifier.Init);
        }
        if (func.is_private) {
          modifiers.push(AbiFunctionModifier.Private);
        }
        if (func.is_payable) {
          modifiers.push(AbiFunctionModifier.Payable);
        }

        if (modifiers.length) {
          upgradedFunc.modifiers = modifiers;
        }

        if (func.callbacks) {
          upgradedFunc.callbacks = func.callbacks.map((c) => convertAbiType(c));
        }

        if (func.callbacks_vec) {
          upgradedFunc.callbacks_vec = convertAbiType(func.callbacks_vec);
        }

        if (func.result) {
          upgradedFunc.result = convertAbiType(func.result);
        }

        if (func.doc) {
          upgradedFunc.doc = func.doc;
        }

        if (func.params?.length) {
          upgradedFunc.params = {
            serialization_type: convertSerializationType(
              func.params[0].serialization_type,
            ),
            args: func.params.length
              ? func.params.map((p) => {
                  return {
                    name: p.name,
                    type_schema: p.type_schema,
                  };
                })
              : [],
          };
        }

        return upgradedFunc;
      }),
    },
  };

  upgradedAbi.metadata = {};

  if (abi.metadata?.name) {
    upgradedAbi.metadata.name = abi.metadata.name;
  }
  if (abi.metadata?.version) {
    upgradedAbi.metadata.version = abi.metadata.version;
  }
  if (abi.metadata?.authors) {
    upgradedAbi.metadata.authors = abi.metadata.authors;
  }

  return { upgraded: true, abiRoot: upgradedAbi };
}

function convertAbiType(abiType: AbiTypeV1) {
  return {
    type_schema: abiType.type_schema,
    serialization_type: convertSerializationType(abiType.serialization_type),
  };
}

function convertSerializationType(serType: string) {
  if (serType === 'json') return AbiSerializationType.Json;
  if (serType === 'borsh') return AbiSerializationType.Borsh;
  throw `Unrecognized serialization type of '${serType}'`;
}

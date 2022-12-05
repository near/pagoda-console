import {
  AbiRoot,
  AbiFunctionKind,
  AbiFunctionModifier,
  AbiSerializationType,
} from 'near-abi-client-js';

import { AbiRoot as AbiRootV1, AbiType as AbiTypeV1 } from './abi.v1';

// ABI client v0.3.0 is not backwards compatible with version v0.1.0 and
// so all v0.1.0 on-chain and in our DB will need to be upgraded
// to at least v0.3.0.
// Newer ABI clients should be backwards compatible with version v0.3.0.
export function upgradeAbi(anyAbi: AbiRootV1 | AbiRoot | any): AbiRoot {
  if (anyAbi?.schema_version === '0.3.0') return anyAbi as AbiRoot;
  if (anyAbi?.schema_version !== '0.1.0')
    throw 'ABI schema version not supported';

  const abi = anyAbi as AbiRootV1;

  return {
    schema_version: abi.schema_version,
    metadata: {
      name: abi.metadata?.name,
      version: abi.metadata?.version,
      authors: abi.metadata?.authors,
    },
    body: {
      root_schema: abi.body.root_schema,
      functions: abi.body.functions.map((func) => {
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

        let callbacks;
        if (func.callbacks) {
          callbacks = func.callbacks.map((c) => convertAbiType(c));
        }

        let callbacks_vec;
        if (func.callbacks_vec) {
          callbacks_vec = convertAbiType(func.callbacks_vec);
        }

        let result;
        if (func.result) {
          result = convertAbiType(func.result);
        }

        return {
          name: func.name,
          doc: func.doc,
          kind: func.is_view ? AbiFunctionKind.View : AbiFunctionKind.Call,
          modifiers,
          params: {
            serialization_type: func.params?.length
              ? convertSerializationType(func.params[0].serialization_type)
              : AbiSerializationType.Json,
            args: func.params?.length
              ? func.params.map((p) => {
                  return {
                    name: p.name,
                    type_schema: p.type_schema,
                  };
                })
              : [],
          },
          ...callbacks,
          ...callbacks_vec,
          ...result,
        };
      }),
    },
  };
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

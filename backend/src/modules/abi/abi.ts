// Copied from https://github.com/near/near-abi-client-js/blob/main/src/abi.ts
import { JSONSchema7 } from 'json-schema';

export interface ABI {
  schema_version: string;
  metadata?: ContractMetadata;
  body: ABIData;
}

export interface ABIData {
  functions: ABIFunction[];
  /** Root JSON schema for the ABI */
  root_schema: JSONSchema7;
}

export interface ContractMetadata {
  name?: string;
  version?: string;
  authors?: string[];
}

export interface ABIFunction {
  name: string;
  is_view?: boolean;
  is_init?: boolean;
  is_payable?: boolean;
  is_private?: boolean;
  params?: ABIParameterInfo[];
  callbacks?: any[];
  callbacks_vec?: ABITypeInfo;
  result?: ABITypeInfo;
}

export interface ABITypeInfo {
  type_schema: JSONSchema7;
  serialization_type: string;
}

export interface ABIParameterInfo extends ABITypeInfo {
  name: string;
}
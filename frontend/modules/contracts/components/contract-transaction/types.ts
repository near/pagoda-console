import type { Api } from '@pc/common/types/api';
import type { Net } from '@pc/database/clients/core';
import type { AbiFunction, AbiParameter, AbiRoot, AnyContract as AbiContract } from 'near-abi-client-js';
import type { UseFormReturn } from 'react-hook-form';

import type { UseMutationResult } from '@/hooks/raw-mutation';

export type Contract = Api.Query.Output<'/projects/getContract'>;

export type TransactionData = unknown;

export type MutateInput = {
  selectedFunction: AbiFunction | undefined;
  methods: AbiContract | null;
  abi: AbiRoot | undefined;
  gas: string;
  deposit: string;
  params: Record<string, any>;
};

export interface TxFormProps {
  contract: Contract;
  methods: AbiContract | null;
  mutation: UseMutationResult<TransactionData, unknown, MutateInput>;
}

export interface TxFormData {
  contractFunction: string;
  gasValue: string;
  gasFormat: 'Tgas' | 'Ggas' | 'Mgas' | 'gas';
  depositValue: string;
  depositFormat: 'NEAR' | 'yoctoⓃ';
  params: Record<string, any>;
}

export interface TxFormDepositProps {
  form: UseFormReturn<TxFormData>;
  nearFormat: string;
}

export interface TxFormDepositFormatProps {
  form: UseFormReturn<TxFormData>;
  nearFormat: string;
}

export interface paramInputs extends AbiParameter {
  type: string;
  label: string;
}

export interface TxFormFunctionParamsProps {
  selectedFunction: AbiFunction;
  form: UseFormReturn<TxFormData>;
  abi: AbiRoot | undefined;
}

export interface TxFormGasProps {
  form: UseFormReturn<TxFormData>;
  gasFormat: 'Tgas' | 'Ggas' | 'Mgas' | 'gas';
  gas: string;
}

export interface TxFormGasFormatProps {
  form: UseFormReturn<TxFormData>;
  gasFormat: string;
}

export interface TxFormSelectFunctionProps {
  form: UseFormReturn<TxFormData>;
  functionItems: Array<AbiFunction> | undefined;
}

export interface TxFormWalletLoginProps {
  onBeforeLogIn: () => void;
}

export interface TxResultProps {
  result: any;
  error: any;
  net: Net;
}

export interface TxResultCodeProps {
  result: any;
}

export interface TxResultErrorProps {
  error: any;
}

export interface TxResultHashProps {
  result: any;
  net: Net;
}

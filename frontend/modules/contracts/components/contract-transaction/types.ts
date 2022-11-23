import type { Api } from '@pc/common/types/api';
import type { Net } from '@pc/database/clients/core';
import type { AbiFunction, AbiParameter, AbiRoot } from 'near-abi-client-js';
import type { UseFormReturn } from 'react-hook-form';

export type Contract = Api.Query.Output<'/projects/getContract'>;

export interface TxFormProps {
  contract: Contract;
  onTxResult: (result: any) => void;
  onTxError: (error: any) => void;
}

export interface TxFormData {
  contractFunction: string;
  gas: string;
  deposit: string;
  nearFormat: 'NEAR' | 'yoctoⓃ';
  gasFormat: 'Tgas' | 'Ggas' | 'Mgas' | 'gas';
  [param: string]: any;
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

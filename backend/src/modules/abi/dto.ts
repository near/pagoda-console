// Note: we use Joi instead of Nest's default recommendation of class-validator
// because class-validator was experiencing issues at the time of implementation
// and had many unaddressed github issues

import * as Joi from 'joi';
import { ABI } from './abi';

// add contract abi
export interface AddContractAbiDto {
  contract: string;
  abi: ABI;
}
const JsonSchemaSchema = Joi.object({}).unknown(true).required();
export const AbiSchema = Joi.object({
  abi_schema_version: Joi.string().required(),
  metadata: Joi.object({
    name: Joi.string(),
    version: Joi.string(),
    authors: Joi.array().items(Joi.string()),
  }).unknown(true),
  abi: Joi.object({
    functions: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          is_view: Joi.boolean(),
          is_init: Joi.boolean(),
          is_payable: Joi.boolean(),
          is_private: Joi.boolean(),
          params: Joi.array().items(
            Joi.object({
              name: Joi.string().required(),
              type_schema: JsonSchemaSchema,
              serialization_type: Joi.string().required(),
            }),
          ),
          result: Joi.object({
            type_schema: JsonSchemaSchema,
            serialization_type: Joi.string().required(),
          }),
        }),
      )
      .required(),
    root_schema: JsonSchemaSchema,
  }).required(),
}).required();
export const AddContractAbiSchema = Joi.object({
  contract: Joi.string().required(),
  abi: AbiSchema,
});

// get contract abi
export interface GetContractAbiDto {
  contract: string;
}
export const GetContractAbiSchema = Joi.object({
  contract: Joi.string().required(),
});

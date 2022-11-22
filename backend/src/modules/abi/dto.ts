// Note: we use Joi instead of Nest's default recommendation of class-validator
// because class-validator was experiencing issues at the time of implementation
// and had many unaddressed github issues

import { Api } from '@pc/common/types/api';
import * as Joi from 'joi';

// add contract abi
const JsonSchemaSchema = Joi.object({}).unknown(true).required();
export const AbiSchema = Joi.object({
  schema_version: Joi.string().required(),
  metadata: Joi.object({
    name: Joi.string(),
    version: Joi.string(),
    authors: Joi.array().items(Joi.string()),
  }).unknown(true),
  body: Joi.object({
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
export const AddContractAbiSchema = Joi.object<
  Api.Mutation.Input<'/abi/addContractAbi'>,
  true
>({
  contract: Joi.string().required(),
  abi: AbiSchema,
});

// get contract abi
export const GetContractAbiSchema = Joi.object<
  Api.Query.Input<'/abi/getContractAbi'>,
  true
>({
  contract: Joi.string().required(),
});

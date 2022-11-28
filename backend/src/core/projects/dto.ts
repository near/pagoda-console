// Note: we use Joi instead of Nest's default recommendation of class-validator
// because class-validator was experiencing issues at the time of implementation
// and had many unaddressed github issues

import { Api } from '@pc/common/types/api';
import * as Joi from 'joi';

const projectNameSchema = Joi.string().required().max(50);

// create project
export const CreateProjectSchema = Joi.object<
  Api.Mutation.Input<'/projects/create'>,
  true
>({
  org: Joi.string(),
  name: projectNameSchema,
  tutorial: Joi.alternatives('NFT_MARKET', 'CROSSWORD'),
});

// eject tutorial project
export const EjectTutorialProjectSchema = Joi.object<
  Api.Mutation.Input<'/projects/ejectTutorial'>,
  true
>({
  slug: Joi.string().required(),
});

// delete project
export const DeleteProjectSchema = Joi.object<
  Api.Mutation.Input<'/projects/delete'>,
  true
>({
  slug: Joi.string().required(),
});

// get project details
export const GetProjectDetailsSchema = Joi.object<
  Api.Query.Input<'/projects/getDetails'>,
  true
>({
  slug: Joi.string().required(),
});

// add contract
export const AddContractSchema = Joi.object<
  Api.Mutation.Input<'/projects/addContract'>,
  true
>({
  project: Joi.string().required(),
  environment: Joi.number().integer().required(),
  address: Joi.string().required(),
});

// remove contract
export const RemoveContractSchema = Joi.object<
  Api.Mutation.Input<'/projects/removeContract'>,
  true
>({
  slug: Joi.string().required(),
});

// get contracts
export const GetContractsSchema = Joi.object<
  Api.Query.Input<'/projects/getContracts'>,
  true
>({
  project: Joi.string().required(),
  environment: Joi.number().integer().required(),
});

// get contract
export const GetContractSchema = Joi.object<
  Api.Query.Input<'/projects/getContract'>,
  true
>({
  slug: Joi.string().required(),
});

// get environments
export const GetEnvironmentsSchema = Joi.object<
  Api.Query.Input<'/projects/getEnvironments'>,
  true
>({
  project: Joi.string().required(),
});

// get keys
export const GetKeysSchema = Joi.object<
  Api.Query.Input<'/projects/getKeys'>,
  true
>({
  project: Joi.string().required(),
});

// rotate key
export const RotateKeySchema = Joi.object<
  Api.Mutation.Input<'/projects/rotateKey'>,
  true
>({
  slug: Joi.string().required(),
});

// generate key
export const GenerateKeySchema = Joi.alternatives().try(
  Joi.object<Api.Mutation.Input<'/projects/generateKey'>, true>({
    project: Joi.string().required(),
    description: Joi.string().required(),
    type: Joi.string().valid('KEY').required(),
  }),
  Joi.object<Api.Mutation.Input<'/projects/generateKey'>, true>({
    project: Joi.string().required(),
    description: Joi.string().required(),
    type: Joi.string().valid('JWT').required(),
    issuer: Joi.string().required(),
    publicKey: Joi.string().required(),
  }),
);

// delete key
export const DeleteKeySchema = Joi.object<
  Api.Mutation.Input<'/projects/deleteKey'>,
  true
>({
  slug: Joi.string().required(),
});

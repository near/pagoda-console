// Note: we use Joi instead of Nest's default recommendation of class-validator
// because class-validator was experiencing issues at the time of implementation
// and had many unaddressed github issues

import { Net, ProjectTutorial } from '.prisma/client';
import * as Joi from 'joi';

const projectNameSchema = Joi.string().required().max(50);

// create project
export interface CreateProjectDto {
  name: string;
  tutorial?: ProjectTutorial;
}
export const CreateProjectSchema = Joi.object({
  name: projectNameSchema,
  tutorial: Joi.string(),
});

// eject tutorial project
export interface EjectTutorialProjectDto {
  slug: string;
}
export const EjectTutorialProjectSchema = Joi.object({
  slug: Joi.string().required(),
});

// delete project
export interface DeleteProjectDto {
  slug: string;
}
export const DeleteProjectSchema = Joi.object({
  slug: Joi.string().required(),
});

// is project name unique
export interface IsProjectNameUniqueDto {
  name: string;
}
export const IsProjectNameUniqueSchema = Joi.object({
  name: projectNameSchema,
});

// get project details
export interface GetProjectDetailsDto {
  slug: string;
}
export const GetProjectDetailsSchema = Joi.object({
  slug: Joi.string().required(),
});

// add contract
export interface AddContractDto {
  project: string;
  environment: number;
  address: string;
}
export const AddContractSchema = Joi.object({
  project: Joi.string().required(),
  environment: Joi.number().integer().required(),
  address: Joi.string().required(),
});

// remove contract
export interface RemoveContractDto {
  id: number;
}
export const RemoveContractSchema = Joi.object({
  id: Joi.number().integer().required(),
});

// get contracts
export interface GetContractsDto {
  project: string;
  environment: number;
}
export const GetContractsSchema = Joi.object({
  project: Joi.string().required(),
  environment: Joi.number().integer().required(),
});

// get environments
export interface GetEnvironmentsDto {
  project: string;
}
export const GetEnvironmentsSchema = Joi.object({
  project: Joi.string().required(),
});

// get environment details
export interface GetEnvironmentsDetailsDto {
  project: string;
  environment: number;
}
export const GetEnvironmentsDetailsSchema = Joi.object({
  project: Joi.string().required(),
  environment: Joi.number().integer().required(),
});

// get keys
export interface GetKeysDto {
  project: string;
}
export const GetKeysSchema = Joi.object({
  project: Joi.string().required(),
});

// rotate key
export interface RotateKeyDto {
  project: string;
  environment: number;
}
export const RotateKeySchema = Joi.object({
  project: Joi.string().required(),
  environment: Joi.number().integer().required(),
});

// rotate transactions
export interface GetTransactionsDto {
  contracts: string[];
  net: Net;
}
export const GetTransactionsSchema = Joi.object({
  contracts: Joi.array().items(Joi.string()),
  net: Joi.string(),
});

// get RPC data
export interface GetRpcUsageDto {
  project: string;
}
export const GetRpcUsageSchema = Joi.object({
  project: Joi.string().required(),
});

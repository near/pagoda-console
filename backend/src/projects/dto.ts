// Note: we use Joi instead of Nest's default recommendation of class-validator
// because class-validator was experiencing issues at the time of implementation
// and had many unaddressed github issues

import * as Joi from 'joi';

// create project
export interface CreateProjectDto {
  name: string;
}
export const CreateProjectSchema = Joi.object({
  name: Joi.string().required().max(50),
});

// delete project
export interface DeleteProjectDto {
  slug: string;
}
export const DeleteProjectSchema = Joi.object({
  slug: Joi.string().required(),
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

// get environment details
export interface GetKeysDto {
  project: string;
}
export const GetKeysSchema = Joi.object({
  project: Joi.string().required(),
});

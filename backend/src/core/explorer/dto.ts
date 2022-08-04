// Note: we use Joi instead of Nest's default recommendation of class-validator
// because class-validator was experiencing issues at the time of implementation
// and had many unaddressed github issues

import * as Joi from 'joi';

// activity
export const ActivityInputSchemas = {
  net: Joi.string(),
  contractId: Joi.string(),
};

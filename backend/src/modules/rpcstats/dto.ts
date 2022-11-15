// Note: we use Joi instead of Nest's default recommendation of class-validator
// because class-validator was experiencing issues at the time of implementation
// and had many unaddressed github issues
import * as Joi from 'joi';
import { Api } from '@pc/common/types/api';

export const EndpointMetricsSchema = Joi.object<
  Api.Query.Input<'/rpcstats/endpointMetrics'>,
  true
>({
  projectSlug: Joi.string().required(),
  environmentSubId: Joi.number().required(),
  startDateTime: Joi.string().required(),
  endDateTime: Joi.string().required(),
  skip: Joi.number().integer().min(0).optional(),
  take: Joi.number().integer().min(0).max(100).optional(),
  pagingDateTime: Joi.date().optional(),
  filter: Joi.alternatives(
    Joi.object({
      type: Joi.string().valid('date'),
      dateTimeResolution: Joi.alternatives(
        'FIFTEEN_SECONDS',
        'ONE_MINUTE',
        'ONE_HOUR',
        'ONE_DAY',
      ),
    }),
    Joi.object({ type: Joi.string().valid('endpoint') }),
  ),
});

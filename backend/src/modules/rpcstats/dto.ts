// Note: we use Joi instead of Nest's default recommendation of class-validator
// because class-validator was experiencing issues at the time of implementation
// and had many unaddressed github issues
import * as Joi from 'joi';
import { DateTime } from 'luxon';
import { Net } from '../alerts/types';

export enum DateTimeResolution {
  FIFTEEN_SECONDS = 'FIFTEEN_SECONDS',
  ONE_MINUTE = 'ONE_MINUTE',
  ONE_HOUR = 'ONE_HOUR',
  ONE_DAY = 'ONE_DAY',
}

export enum MetricGroupBy {
  DATE = 'date',
  ENDPOINT = 'endpoint',
}
export interface EndpointMetricsDto {
  projectSlug: string;
  environmentSubId: number;
  startDateTime: string;
  endDateTime: string;
  dateTimeResolution: DateTimeResolution;
  skip?: number;
  take?: number;
  pagingDateTime?: Date;
  grouping?: MetricGroupBy[];
}

export const EndpointMetricsSchema = Joi.object({
  projectSlug: Joi.string().required(),
  environmentSubId: Joi.number().required(),
  startDateTime: Joi.string().required(),
  endDateTime: Joi.string().required(),
  dateTimeResolution: Joi.string().optional(),
  grouping: Joi.array().items(Joi.string().required()).optional(),
  skip: Joi.number().integer().min(0).optional(),
  take: Joi.number().integer().min(0).max(100).optional(),
  pagingDateTime: Joi.date().optional(),
});

export interface EndpointMetricsDetailsResponseDto {
  apiKeyIdentifier: string;
  endpointGroup?: string;
  endpointMethod: string;
  network: Net;
  windowStart?: DateTime;
  windowEnd?: DateTime;
  successCount: number;
  errorCount: number;
  minLatency: number;
  maxLatency: number;
  meanLatency: number;
}

export interface EndpointMetricsResponseDto {
  count: number;
  page: EndpointMetricsDetailsResponseDto[];
}

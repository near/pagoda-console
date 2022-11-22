import { Api } from '@pc/common/types/api';
import { CreateAlertSchema } from './dto';

const contract = 'pagoda.near';
const projectSlug = '123xyz';
const environmentSubId = 1;

const validSchemas: Api.Mutation.Input<'/alerts/createAlert'>[] = [
  { projectSlug, environmentSubId, rule: { type: 'TX_SUCCESS', contract } },
  { projectSlug, environmentSubId, rule: { type: 'TX_FAILURE', contract } },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'FN_CALL',
      contract,
      function: '*',
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'EVENT',
      contract,
      standard: '*',
      event: '*',
      version: '*',
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_NUM',
      contract,
      from: undefined,
      to: '34028236692463463374607000000',
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_NUM',
      contract,
      from: '340283463374607000000',
      to: undefined,
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_PCT',
      contract,
      from: 10,
      to: undefined,
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_PCT',
      contract,
      from: undefined,
      to: 100,
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_NUM',
      contract,
      from: '0',
      to: '0',
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_PCT',
      contract,
      from: 0,
      to: 0,
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_PCT',
      contract,
      from: 0,
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_PCT',
      contract,
      to: 0,
    },
  },
];

test.each(validSchemas)('%o should be valid', (input) => {
  const result = CreateAlertSchema.validate(input);
  expect(result.error).toBeUndefined();
});

const invalidSchemas: Api.Mutation.Input<'/alerts/createAlert'>[] = [
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_NUM',
      contract,
      from: undefined,
      to: undefined,
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_NUM',
      contract,
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_NUM',
      contract,
      from: '-1',
      to: undefined,
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_NUM',
      contract,
      from: '3',
      to: '1',
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_NUM',
      contract,
      from: '340282366920938463463374607431768211456',
      to: undefined,
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_NUM',
      contract,
      from: undefined,
      to: '340282366920938463463374607431768211456',
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_PCT',
      contract,
      from: undefined,
      to: undefined,
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_PCT',
      contract,
      from: 101,
      to: undefined,
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_PCT',
      contract,
      from: 0,
      to: 101,
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_PCT',
      contract,
      from: -1,
      to: undefined,
    },
  },
];

test.each(invalidSchemas)('%o should throw errors', (input) => {
  const result = CreateAlertSchema.validate(input);
  expect(result.error).toBeDefined();
});

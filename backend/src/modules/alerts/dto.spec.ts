import { CreateAlertSchema } from './dto';

const contract = 'pagoda.near';
const projectSlug = '123xyz';
const environmentSubId = 1;

test.each([
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
      from: null,
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
      to: null,
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_PCT',
      contract,
      from: '10',
      to: null,
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_PCT',
      contract,
      from: null,
      to: '100',
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
      from: '0',
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_PCT',
      contract,
      to: '0',
    },
  },
])('%o should be valid', (input) => {
  const result = CreateAlertSchema.validate(input);
  expect(result.error).toBeUndefined();
});

test.each([
  { projectSlug, environmentSubId, rule: { type: 'INCORRECT', contract } },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_NUM',
      contract,
      from: null,
      to: null,
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
      to: null,
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
      to: null,
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_NUM',
      contract,
      from: null,
      to: '340282366920938463463374607431768211456',
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_PCT',
      contract,
      from: null,
      to: null,
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_PCT',
      contract,
      from: '101',
      to: null,
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_PCT',
      contract,
      from: '0',
      to: '101',
    },
  },
  {
    projectSlug,
    environmentSubId,
    rule: {
      type: 'ACCT_BAL_PCT',
      contract,
      from: '-1',
      to: null,
    },
  },
])('%o should throw errors', (input) => {
  const result = CreateAlertSchema.validate(input);
  expect(result.error).toBeDefined();
});

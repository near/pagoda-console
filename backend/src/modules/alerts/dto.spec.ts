import { CreateAlertSchema } from './dto';

const contract = 'pagoda.near';
const projectSlug = '123xyz';
const environmentSubId = 1;

test.each([
  { type: 'TX_SUCCESS', projectSlug, environmentSubId, rule: { contract } },
  { type: 'TX_FAILURE', projectSlug, environmentSubId, rule: { contract } },
  {
    type: 'FN_CALL',
    projectSlug,
    environmentSubId,
    rule: { contract, function: '*' },
  },
  {
    type: 'EVENT',
    projectSlug,
    environmentSubId,
    rule: { contract, standard: '*', event: '*', version: '*' },
  },
  {
    type: 'ACCT_BAL_NUM',
    projectSlug,
    environmentSubId,
    rule: { contract, from: null, to: '34028236692463463374607000000' },
  },
  {
    type: 'ACCT_BAL_NUM',
    projectSlug,
    environmentSubId,
    rule: { contract, from: '340283463374607000000', to: null },
  },
  {
    type: 'ACCT_BAL_PCT',
    projectSlug,
    environmentSubId,
    rule: { contract, from: '10', to: null },
  },
  {
    type: 'ACCT_BAL_PCT',
    projectSlug,
    environmentSubId,
    rule: { contract, from: null, to: '100' },
  },
  {
    type: 'ACCT_BAL_NUM',
    projectSlug,
    environmentSubId,
    rule: { contract, from: '0', to: '0' },
  },
  {
    type: 'ACCT_BAL_PCT',
    projectSlug,
    environmentSubId,
    rule: { contract, from: '0', to: '0' },
  },
  {
    type: 'ACCT_BAL_PCT',
    projectSlug,
    environmentSubId,
    rule: { contract, from: '0' },
  },
  {
    type: 'ACCT_BAL_PCT',
    projectSlug,
    environmentSubId,
    rule: { contract, to: '0' },
  },
])('%o should be valid', (input) => {
  const result = CreateAlertSchema.validate(input);
  expect(result.error).toBeUndefined();
});

test.each([
  { type: 'INCORRECT', projectSlug, environmentSubId, rule: { contract } },
  {
    type: 'ACCT_BAL_NUM',
    projectSlug,
    environmentSubId,
    rule: { contract, from: null, to: null },
  },
  {
    type: 'ACCT_BAL_NUM',
    projectSlug,
    environmentSubId,
    rule: { contract },
  },
  {
    type: 'ACCT_BAL_NUM',
    projectSlug,
    environmentSubId,
    rule: { contract, from: '-1', to: null },
  },
  {
    type: 'ACCT_BAL_NUM',
    projectSlug,
    environmentSubId,
    rule: { contract, from: '3', to: '1' },
  },
  {
    type: 'ACCT_BAL_NUM',
    projectSlug,
    environmentSubId,
    rule: {
      contract,
      from: '340282366920938463463374607431768211456',
      to: null,
    },
  },
  {
    type: 'ACCT_BAL_NUM',
    projectSlug,
    environmentSubId,
    rule: {
      contract,
      from: null,
      to: '340282366920938463463374607431768211456',
    },
  },
  {
    type: 'ACCT_BAL_PCT',
    projectSlug,
    environmentSubId,
    rule: { contract, from: null, to: null },
  },
  {
    type: 'ACCT_BAL_PCT',
    projectSlug,
    environmentSubId,
    rule: { contract, from: '101', to: null },
  },
  {
    type: 'ACCT_BAL_PCT',
    projectSlug,
    environmentSubId,
    rule: { contract, from: '0', to: '101' },
  },
  {
    type: 'ACCT_BAL_PCT',
    projectSlug,
    environmentSubId,
    rule: { contract, from: '-1', to: null },
  },
])('%o should throw errors', (input) => {
  const result = CreateAlertSchema.validate(input);
  expect(result.error).toBeDefined();
});

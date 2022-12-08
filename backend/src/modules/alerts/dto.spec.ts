import { z } from 'zod';
import { Alerts } from '@pc/common/types/alerts';

const contract = 'pagoda.near';

const validSchemas: z.infer<typeof Alerts.rule>[] = [
  { type: 'TX_SUCCESS', contract },
  { type: 'TX_FAILURE', contract },
  {
    type: 'FN_CALL',
    contract,
    function: '*',
  },
  {
    type: 'EVENT',
    contract,
    standard: '*',
    event: '*',
    version: '*',
  },
  {
    type: 'ACCT_BAL_NUM',
    contract,
    from: undefined,
    to: '34028236692463463374607000000',
  },
  {
    type: 'ACCT_BAL_NUM',
    contract,
    from: '340283463374607000000',
    to: undefined,
  },
  {
    type: 'ACCT_BAL_PCT',
    contract,
    from: 10,
    to: undefined,
  },
  {
    type: 'ACCT_BAL_PCT',
    contract,
    from: undefined,
    to: 100,
  },
  {
    type: 'ACCT_BAL_NUM',
    contract,
    from: '0',
    to: '0',
  },
  {
    type: 'ACCT_BAL_PCT',
    contract,
    from: 0,
    to: 0,
  },
  {
    type: 'ACCT_BAL_PCT',
    contract,
    from: 0,
  },
  {
    type: 'ACCT_BAL_PCT',
    contract,
    to: 0,
  },
];

test.each(validSchemas)('%o should be valid', (input) => {
  const result = Alerts.rule.safeParse(input);
  expect(result.success).toBeTruthy();
});

const invalidSchemas: z.infer<typeof Alerts.rule>[] = [
  {
    type: 'ACCT_BAL_NUM',
    contract,
    from: undefined,
    to: undefined,
  },
  {
    type: 'ACCT_BAL_NUM',
    contract,
  },
  {
    type: 'ACCT_BAL_NUM',
    contract,
    from: '-1',
    to: undefined,
  },
  {
    type: 'ACCT_BAL_NUM',
    contract,
    from: '3',
    to: '1',
  },
  {
    type: 'ACCT_BAL_NUM',
    contract,
    from: '340282366920938463463374607431768211456',
    to: undefined,
  },
  {
    type: 'ACCT_BAL_NUM',
    contract,
    from: undefined,
    to: '340282366920938463463374607431768211456',
  },
  {
    type: 'ACCT_BAL_PCT',
    contract,
    from: undefined,
    to: undefined,
  },
  {
    type: 'ACCT_BAL_PCT',
    contract,
    from: 101,
    to: undefined,
  },
  {
    type: 'ACCT_BAL_PCT',
    contract,
    from: 0,
    to: 101,
  },
  {
    type: 'ACCT_BAL_PCT',
    contract,
    from: -1,
    to: undefined,
  },
];

test.each(invalidSchemas)('%o should throw errors', (input) => {
  const result = Alerts.rule.safeParse(input);
  expect(result.success).toBeFalsy();
});

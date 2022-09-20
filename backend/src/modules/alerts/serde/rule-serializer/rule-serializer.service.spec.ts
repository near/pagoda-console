import { Test, TestingModule } from '@nestjs/testing';
import { RuleSerializerService } from './rule-serializer.service';

describe('RuleSerializerService', () => {
  let service: RuleSerializerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RuleSerializerService],
    }).compile();

    service = module.get<RuleSerializerService>(RuleSerializerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should serialize success tx rule', () => {
    expect(service.toTxSuccessJson({ contract: 'pagoda.near' })).toStrictEqual({
      affected_account_id: 'pagoda.near',
      rule: 'ACTION_ANY',
      status: 'SUCCESS',
    });
  });

  it('should serialize failure tx rule', () => {
    expect(service.toTxFailureJson({ contract: 'pagoda.near' })).toStrictEqual({
      affected_account_id: 'pagoda.near',
      rule: 'ACTION_ANY',
      status: 'FAIL',
    });
  });

  it('should serialize function call rule', () => {
    expect(
      service.toFnCallJson({ contract: 'pagoda.near', function: 'mint_nft' }),
    ).toStrictEqual({
      affected_account_id: 'pagoda.near',
      rule: 'ACTION_FUNCTION_CALL',
      status: 'ANY',
      function: 'mint_nft',
    });
  });

  it('should serialize event rule', () => {
    expect(
      service.toEventJson({
        contract: 'pagoda.near',
        standard: '*',
        version: '*',
        event: '*',
      }),
    ).toStrictEqual({
      rule: 'EVENT',
      contract_account_id: 'pagoda.near',
      standard: '*',
      version: '*',
      event: '*',
    });
  });

  test.each([
    {
      dto: { contract: 'pagoda.near', from: '0', to: null },
      expected: {
        rule: 'STATE_CHANGE_ACCOUNT_BALANCE',
        affected_account_id: 'pagoda.near',
        comparator_kind: 'RELATIVE_YOCTONEAR_AMOUNT',
        comparator_range: {
          from: '0',
          to: null,
        },
      },
    },
    {
      dto: { contract: 'pagoda.near', to: '330', from: null },
      expected: {
        rule: 'STATE_CHANGE_ACCOUNT_BALANCE',
        affected_account_id: 'pagoda.near',
        comparator_kind: 'RELATIVE_YOCTONEAR_AMOUNT',
        comparator_range: {
          from: null,
          to: '330',
        },
      },
    },
    {
      dto: { contract: 'pagoda.near', from: '0', to: '9000000000000000' },
      expected: {
        rule: 'STATE_CHANGE_ACCOUNT_BALANCE',
        affected_account_id: 'pagoda.near',
        comparator_kind: 'RELATIVE_YOCTONEAR_AMOUNT',
        comparator_range: {
          from: '0',
          to: '9000000000000000',
        },
      },
    },
  ])('should serialize account balance num rule', ({ dto, expected }) => {
    expect(service.toAcctBalJson(dto, 'ACCT_BAL_NUM')).toStrictEqual(expected);
  });

  it('should serialize account balance pct rule', () => {
    expect(
      service.toAcctBalJson(
        { contract: 'pagoda.near', from: '0', to: null },
        'ACCT_BAL_PCT',
      ),
    ).toStrictEqual({
      rule: 'STATE_CHANGE_ACCOUNT_BALANCE',
      affected_account_id: 'pagoda.near',
      comparator_kind: 'RELATIVE_PERCENTAGE_AMOUNT',
      comparator_range: {
        from: '0',
        to: null,
      },
    });
  });

  it('should fail to serialize account balance rule with invalid range', () => {
    expect(() => {
      service.toAcctBalJson(
        { contract: 'pagoda.near', from: null, to: null },
        'ACCT_BAL_PCT',
      );
    }).toThrow('Invalid range');
  });

  it('should fail to serialize account balance rule with from > to', () => {
    expect(() => {
      service.toAcctBalJson(
        { contract: 'pagoda.near', from: '3', to: '0' },
        'ACCT_BAL_PCT',
      );
    }).toThrow('Invalid range');
  });
});

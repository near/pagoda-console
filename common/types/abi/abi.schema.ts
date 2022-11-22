import type { AbiRoot } from 'near-abi-client-js';
import { Abi } from '@pc/database/clients/abi';

export namespace Query {
  export namespace Inputs {
    export type GetContractAbi = { contract: string };
  }

  export namespace Outputs {
    export type GetContractAbi = Pick<Abi, 'contractSlug'> & {
      abi: AbiRoot;
    };
  }

  export namespace Errors {
    export type GetContractAbi = unknown;
  }
}

export namespace Mutation {
  export namespace Inputs {
    export type AddContractAbi = { contract: string; abi: AbiRoot };
  }

  export namespace Outputs {
    export type AddContractAbi = Pick<Abi, 'contractSlug'> & {
      abi: AbiRoot;
    };
  }

  export namespace Errors {
    export type AddContractAbi = unknown;
  }
}

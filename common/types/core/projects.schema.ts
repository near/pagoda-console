import {
  Project,
  Org,
  Contract,
  ProjectTutorial,
  ApiKey,
  Environment,
} from '@pc/database/clients/core';

export namespace Query {
  export namespace Inputs {
    export type GetDetails = { slug: string };
    export type GetContracts = { project: string; environment: number };
    export type GetContract = { slug: string };
    export type List = void;
    export type GetEnvironments = { project: string };
    export type GetKeys = { project: string };
  }

  export namespace Outputs {
    export type GetDetails = Pick<Project, 'name' | 'slug' | 'tutorial'> & {
      org: Pick<Org, 'name' | 'slug' | 'personalForUserId'>;
    };
    export type GetContracts = Pick<Contract, 'slug' | 'address' | 'net'>[];
    export type GetContract = Pick<Contract, 'slug' | 'address' | 'net'>;
    export type List = (Pick<
      Project,
      'name' | 'slug' | 'tutorial' | 'active'
    > & {
      org: Pick<Org, 'slug' | 'name'> & {
        isPersonal: boolean;
      };
    })[];
    export type GetEnvironments = Pick<Environment, 'subId' | 'net' | 'name'>[];
    export type GetKeys = (Pick<ApiKey, 'description'> & {
      keySlug: ApiKey['slug'];
      key: string;
    })[];
  }

  export namespace Errors {
    export type GetDetails = unknown;
    export type GetContracts = unknown;
    export type GetContract = unknown;
    export type List = unknown;
    export type GetEnvironments = unknown;
    export type GetKeys = unknown;
  }
}

export namespace Mutation {
  export namespace Inputs {
    export type Create = {
      org?: string;
      name: string;
      tutorial?: ProjectTutorial;
    };
    export type EjectTutorial = { slug: string };
    export type Delete = { slug: string };
    export type AddContract = {
      project: string;
      environment: number;
      address: string;
    };
    export type RemoveContract = { slug: string };
    export type RotateKey = { slug: string };
    export type GenerateKey = { project: string; description: string };
    export type DeleteKey = { slug: string };
  }

  export namespace Outputs {
    export type Create = Pick<Project, 'name' | 'slug'>;
    export type EjectTutorial = void;
    export type Delete = void;
    export type AddContract = Pick<Contract, 'id' | 'slug' | 'address' | 'net'>;
    export type RemoveContract = void;
    export type RotateKey = Pick<ApiKey, 'description'> & {
      keySlug: ApiKey['slug'];
      key: string;
    };
    export type GenerateKey = Pick<ApiKey, 'description'> & {
      keySlug: ApiKey['slug'];
      key: string;
    };
    export type DeleteKey = void;
  }

  export namespace Errors {
    export type Create = unknown;
    export type EjectTutorial = unknown;
    export type Delete = unknown;
    export type AddContract = unknown;
    export type RemoveContract = unknown;
    export type RotateKey = unknown;
    export type GenerateKey = unknown;
    export type DeleteKey = unknown;
  }
}

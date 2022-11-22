import {
  Org,
  OrgRole,
  User,
  OrgMember,
  OrgInvite,
} from '@pc/database/clients/core';

export namespace Query {
  export namespace Inputs {
    export type GetAccountDetails = void;
    export type ListOrgsWithOnlyAdmin = void;
    export type ListOrgMembers = { org: Org['slug'] };
    export type ListOrgs = void;
  }

  export namespace Outputs {
    export type GetAccountDetails = {
      uid?: string;
      email?: string;
      name?: string;
      photoUrl?: string;
    };
    export type ListOrgsWithOnlyAdmin = Pick<Org, 'name' | 'slug'>[];
    export type ListOrgMembers = (Pick<OrgInvite, 'orgSlug' | 'role'> &
      (
        | {
            isInvite: true;
            user: {
              uid: null;
              email: OrgInvite['email'];
            };
          }
        | {
            isInvite: false;
            user: Pick<User, 'email' | 'uid'>;
          }
      ))[];
    export type ListOrgs = (Pick<Org, 'slug' | 'name'> & {
      isPersonal: boolean;
    })[];
  }

  export namespace Errors {
    export type GetAccountDetails = unknown;
    export type ListOrgsWithOnlyAdmin = unknown;
    export type ListOrgMembers = unknown;
    export type ListOrgs = unknown;
  }
}

export namespace Mutation {
  export namespace Inputs {
    export type DeleteAccount = void;
    export type CreateOrg = { name: string };
    export type InviteToOrg = {
      org: Org['slug'];
      email: string;
      role: OrgRole;
    };
    export type AcceptOrgInvite = { token: string };
    export type DeleteOrg = { org: Org['slug'] };
    export type ChangeOrgRole = {
      org: Org['slug'];
      role: OrgRole;
      user: User['uid'];
    };
    export type RemoveFromOrg = {
      org: Org['slug'];
      user: User['uid'];
    };
    export type RemoveOrgInvite = {
      org: Org['slug'];
      email: string;
    };
    export type ResetPassword = { email: string };
  }

  export namespace Outputs {
    export type DeleteAccount = void;
    export type CreateOrg = Pick<Org, 'name' | 'slug'> & {
      isPersonal: false;
    };
    export type InviteToOrg = void;
    export type AcceptOrgInvite = Pick<Org, 'name' | 'slug'>;
    export type DeleteOrg = void;
    export type ChangeOrgRole = Pick<OrgMember, 'orgSlug' | 'role'> & {
      user: Pick<User, 'uid' | 'email'>;
    };
    export type RemoveFromOrg = void;
    export type RemoveOrgInvite = void;
    export type ResetPassword = void;
  }

  export namespace Errors {
    export type DeleteAccount = unknown;
    export type CreateOrg = unknown;
    export type InviteToOrg = unknown;
    export type AcceptOrgInvite = unknown;
    export type DeleteOrg = unknown;
    export type ChangeOrgRole = unknown;
    export type RemoveFromOrg = unknown;
    export type RemoveOrgInvite = unknown;
    export type ResetPassword = unknown;
  }
}

import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  User,
  Prisma,
  Org,
  OrgRole,
  OrgInvite,
  OrgMember,
} from '@pc/database/clients/core';
import { VError } from 'verror';
import { customAlphabet } from 'nanoid';
import { DateTime } from 'luxon';
import { AppConfig } from '../../config/validate';
import { ConfigService } from '@nestjs/config';
import { UserError } from './user-error';
import { OrgInviteEmailService } from './org-invite-email.service';
import { ModuleRef } from '@nestjs/core';
import { ProjectsService } from '../projects/projects.service';
import firebaseAdmin from 'firebase-admin';
import { ApiKeysService } from '../keys/apiKeys.service';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { Projects } from '@pc/common/types/core';

const newOrgSlug = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  13,
);
const newInviteToken = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  14,
);

const newEmsId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 20);

const DEFAULT_TEAM_NAME = 'default';

@Injectable()
export class UsersService implements OnModuleInit {
  private orgInviteExpiryMinutes: number;
  private projectsService!: ProjectsService;
  constructor(
    private prisma: PrismaService,
    private config: ConfigService<AppConfig>,
    private orgInviteEmail: OrgInviteEmailService,
    private moduleRef: ModuleRef,
    private apiKeysService: ApiKeysService,
  ) {
    this.orgInviteExpiryMinutes = this.config.get(
      'orgs.inviteTokenExpiryMinutes',
      {
        infer: true,
      },
    )!;
  }

  // * ProjectsService is being resolved this way in order to not have a direct link to the ProjectsModule.
  // The ProjectsModule might have a reference to the UsersModule in the future and there should not be a circular dependency.
  // There are other patterns to remove the circular dependency but this is the easiest one to go with right now.
  // https://docs.nestjs.com/fundamentals/module-ref#retrieving-instances
  onModuleInit() {
    this.projectsService = this.moduleRef.get(ProjectsService, {
      strict: false,
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const metadata = {
      createdByUser: {
        connect: {
          email: data.email,
        },
      },
      updatedByUser: {
        connect: {
          email: data.email,
        },
      },
    };

    const orgSlug = newOrgSlug() as Projects.OrgSlug;
    const emsId = newEmsId();
    try {
      await this.apiKeysService.createOrganization(emsId, orgSlug);
    } catch (e: any) {
      throw new VError(
        { info: { code: UserError.SERVER_ERROR } },
        'Creating a kong consumer for an org failed.',
      );
    }

    return this.prisma.user.create({
      data: {
        ...data,
        teamMembers: {
          create: {
            team: {
              create: {
                name: DEFAULT_TEAM_NAME,
                ...metadata,
                org: {
                  create: {
                    slug: orgSlug,
                    name: `personal-${orgSlug}`,
                    personalForUser: {
                      connect: {
                        // ! It is important to use uid here and not email. There are some issues connecting on email when a user soft-deletes their account and recreates it. Prisma will null the `personalForUserId` of the user's previous account (which could cause issues when auditing the DB).
                        uid: data.uid,
                      },
                    },
                    orgMembers: {
                      create: {
                        user: {
                          connect: {
                            uid: data.uid,
                          },
                        },
                        role: OrgRole.ADMIN,
                        ...metadata,
                      },
                    },
                    emsId,
                    ...metadata,
                  },
                },
              },
            },
            ...metadata,
          },
        },
      },
    });
  }

  async findActive(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });

    if (!user?.active) {
      // handles both failure to find user and user not active
      return null;
    }

    return user;
  }

  async deactivateUser(uid: User['uid']) {
    const isOnlyOrgAdmin = await this.isOnlyOrgAdmin(uid);
    if (isOnlyOrgAdmin) {
      throw new VError(
        { info: { code: UserError.ORG_FINAL_ADMIN } },
        'User is the only admin of an org',
      );
    }

    await firebaseAdmin.auth().deleteUser(uid);

    const user = (await this.findActive({ uid }))!;

    await this.projectsService.deleteApiKeysByUser(user);

    try {
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: {
            uid,
          },
          data: {
            active: false,
          },
        }),
        // Delete personal org.
        this.prisma.org.updateMany({
          where: {
            personalForUserId: user.id,
          },
          data: {
            active: false,
            updatedBy: user.id,
          },
        }),
        this.prisma.orgMember.deleteMany({
          where: {
            userId: user.id,
          },
        }),
        // Delete personal team on personal org.
        this.prisma.team.updateMany({
          where: {
            org: {
              personalForUserId: user.id,
            },
          },
          data: {
            active: false,
            updatedBy: user.id,
          },
        }),
        this.prisma.project.updateMany({
          where: {
            org: {
              personalForUserId: user.id,
            },
          },
          data: {
            active: false,
            updatedBy: user.id,
          },
        }),
        this.prisma.teamProject.updateMany({
          where: {
            project: {
              org: {
                personalForUserId: user.id,
              },
            },
          },
          data: {
            active: false,
            updatedBy: user.id,
          },
        }),
        this.prisma.teamMember.deleteMany({
          where: {
            userId: user.id,
          },
        }),
        this.prisma.environment.updateMany({
          where: {
            project: {
              org: {
                personalForUserId: user.id,
              },
            },
          },
          data: {
            active: false,
            updatedBy: user.id,
          },
        }),
        this.prisma.contract.updateMany({
          where: {
            environment: {
              project: {
                org: {
                  personalForUserId: user.id,
                },
              },
            },
          },
          data: {
            active: false,
            updatedBy: user.id,
          },
        }),
      ]);
    } catch (e: any) {
      throw new VError(e, 'Failed while deactivating user in database');
    }
  }

  // can be called directly by org creation endpoint or internally during user creation
  async createOrg(callingUser: User, name: Org['name']) {
    if (!name) {
      throw new VError(
        { info: { code: UserError.MISSING_ORG_NAME } },
        'A name must be provided when creating a shared org',
      );
    }

    const conflict = await this.prisma.org.findUnique({
      where: {
        name,
      },
    });

    if (conflict) {
      throw new VError(
        { info: { code: UserError.NAME_CONFLICT } },
        'An org with this name already exists',
      );
    }

    const metadata = this.creationMetadata(callingUser);

    const slug = newOrgSlug() as Projects.OrgSlug;
    const emsId = newEmsId();
    try {
      await this.apiKeysService.createOrganization(emsId, slug);
    } catch (e: any) {
      throw new VError(
        { info: { code: UserError.SERVER_ERROR } },
        'Creating a kong consumer for an org failed.',
      );
    }

    // create org, create default team, add user to team, add user to org
    const created = await this.prisma.org.create({
      data: {
        ...metadata,
        slug,
        name,
        orgMembers: {
          create: {
            userId: callingUser.id,
            role: OrgRole.ADMIN,
            ...metadata,
          },
        },
        teams: {
          create: {
            name: DEFAULT_TEAM_NAME,
            teamMembers: {
              create: {
                userId: callingUser.id,
                ...metadata,
              },
            },
            ...metadata,
          },
        },
        emsId,
      },
      select: {
        slug: true,
        name: true,
      },
    });

    return {
      ...created,
      isPersonal: false as const,
    };
  }

  // TODO don't invite someone who is already an active member of the org.
  // TODO members should not be able to invite an admin to the org.
  async inviteToOrg(
    callingUser: User,
    orgSlug: Projects.OrgSlug,
    recipient: User['email'],
    role: OrgRole,
  ) {
    // check that user has permission to invite
    const permissionCheck = await this.checkOrgPermission(
      orgSlug,
      callingUser.id,
    );

    if (permissionCheck.isPersonal) {
      throw new VError(
        { info: { code: UserError.BAD_ORG } },
        'Users cannot be invited to personal orgs',
      );
    }

    if (permissionCheck.role !== OrgRole.ADMIN) {
      throw new VError(
        { info: { code: UserError.PERMISSION_DENIED } },
        'User does not have invite permissions',
      );
    }

    let existingMember;
    try {
      existingMember = await this.prisma.orgMember.findFirst({
        where: {
          orgSlug,
          user: {
            email: recipient,
            active: true,
          },
        },
      });
    } catch (e: any) {
      throw new VError(
        e,
        'Failed to determine if user is an existing member of the org',
      );
    }

    if (existingMember) {
      throw new VError(
        { info: { code: UserError.ORG_INVITE_ALREADY_MEMBER } },
        'The user is already a member of the org',
      );
    }

    const orgName = permissionCheck.name;
    const token = newInviteToken();
    let res: OrgInvite;
    try {
      res = await this.prisma.orgInvite.create({
        data: {
          email: recipient,
          orgSlug,
          token,
          tokenExpiresAt: this.calculateExpiryDate(this.orgInviteExpiryMinutes),
          role,
          ...this.creationMetadata(callingUser),
        },
      });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (e.code === 'P2002') {
          throw new VError(
            { info: { code: UserError.ORG_INVITE_DUPLICATE } },
            'An invite already exists for this org and email',
          );
        }
      }
      throw new VError(e, 'Failed to create OrgInvite DB record');
    }

    try {
      await this.orgInviteEmail.sendInvite(orgName, recipient, token);
    } catch (e: any) {
      try {
        await this.prisma.orgInvite.delete({
          where: {
            id: res.id,
          },
        });
      } catch (e: any) {
        console.error('Failed while rolling back org invite creation', e);
      }

      throw new VError(e, 'Failed to send an org invitation email');
    }
  }

  async removeOrgInvite(
    callingUser: User,
    orgSlug: Projects.OrgSlug,
    target: User['email'],
  ) {
    // check that user has permission to remove invites
    const permissionCheck = await this.checkOrgPermission(
      orgSlug,
      callingUser.id,
    );

    if (permissionCheck.isPersonal) {
      throw new VError(
        { info: { code: UserError.BAD_ORG } },
        'User invites do not exist on personal orgs',
      );
    }

    if (permissionCheck.role !== OrgRole.ADMIN) {
      throw new VError(
        { info: { code: UserError.PERMISSION_DENIED } },
        'Non-admin attempted to remove another user',
      );
    }

    try {
      await this.prisma.orgInvite.delete({
        where: {
          orgSlug_email: {
            email: target,
            orgSlug,
          },
        },
      });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (e.code === 'P2025') {
          throw new VError(
            { info: { code: UserError.BAD_ORG_INVITE } },
            'Org invite not found',
          );
        }
      }
      throw new VError(e, 'Failed to delete org invite');
    }
  }

  async acceptOrgInvite(callingUser: User, token: OrgInvite['token']) {
    let invite: Pick<
      OrgInvite,
      'email' | 'tokenExpiresAt' | 'orgSlug' | 'role'
    > & { org: Pick<Org, 'name' | 'slug' | 'active'> };
    try {
      invite = (await this.prisma.orgInvite.findUnique({
        where: {
          token,
        },
        select: {
          email: true,
          tokenExpiresAt: true,
          orgSlug: true,
          role: true,
          org: {
            select: {
              name: true,
              slug: true,
              active: true,
            },
          },
        },
      }))!;
    } catch (e: any) {
      throw new VError(e, 'Failed while looking up org invite');
    }

    // does an invite with this token exist?
    if (!invite) {
      throw new VError(
        { info: { code: UserError.ORG_INVITE_BAD_TOKEN } },
        'No invite found for token',
      );
    }

    const org = {
      name: invite.org.name,
      slug: invite.org.slug,
    };

    // is the invite being redeemed by a user with the correct email address?
    if (invite.email.toLowerCase() !== callingUser.email.toLowerCase()) {
      throw new VError(
        { info: { code: UserError.ORG_INVITE_EMAIL_MISMATCH } },
        'The token belongs to an invite for a different email address',
      );
    }

    // is the invite token expired?
    if (DateTime.now() > DateTime.fromJSDate(invite.tokenExpiresAt)) {
      throw new VError(
        { info: { code: UserError.ORG_INVITE_EXPIRED, org } },
        'The invite token has expired',
      );
    }

    // is the org deleted?
    if (!invite.org.active) {
      throw new VError(
        { info: { code: UserError.BAD_ORG } },
        'Org is soft-deleted',
      );
    }

    // is the user already in the org?
    // We'll skip an additional lookup here and defer to the DB constraint to reject in this case

    // invite is valid, execute acceptance

    // fetch default team ahead of time because nested connect is throwing type errors
    let defaultTeam: { id: number };
    try {
      defaultTeam = (await this.prisma.team.findUnique({
        where: {
          orgSlug_name: {
            orgSlug: invite.orgSlug,
            name: DEFAULT_TEAM_NAME,
          },
        },
      }))!;
    } catch (e: any) {
      throw new VError(e, 'Failed while fetching default team');
    }

    try {
      await this.prisma.$transaction([
        this.prisma.orgMember.create({
          data: {
            orgSlug: invite.orgSlug,
            role: invite.role,
            userId: callingUser.id,
            ...this.creationMetadata(callingUser),
          },
        }),
        this.prisma.teamMember.create({
          data: {
            userId: callingUser.id,
            teamId: defaultTeam.id,
            ...this.creationMetadata(callingUser),
          },
        }),
        this.prisma.orgInvite.delete({
          where: {
            token,
          },
        }),
      ]);
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (e.code === 'P2002') {
          throw new VError(
            { info: { code: UserError.ORG_INVITE_ALREADY_MEMBER, org } },
            'The user is already a member of the org',
          );
        }
      }

      throw new VError(
        e,
        'Failed while executing transaction to create OrgMember, create TeamMember, and delete OrgInvite',
      );
    }

    return org;
  }

  async removeFromOrg(
    callingUser: User,
    orgSlug: Projects.OrgSlug,
    targetUser: User['uid'],
  ) {
    const orgCheck = await this.checkOrgPermission(orgSlug, callingUser.id);

    if (orgCheck.isPersonal) {
      throw new VError(
        { info: { code: UserError.BAD_ORG_PERSONAL } },
        'User cannot be removed from personal orgs',
      );
    }

    // Any member can remove themselves from an org.
    // Admins can remove anyone.
    if (orgCheck.role !== OrgRole.ADMIN && callingUser.uid !== targetUser) {
      throw new VError(
        { info: { code: UserError.PERMISSION_DENIED } },
        'Non-admin attempted to remove another user',
      );
    }

    const hasOtherAdmin = await this.hasOtherAdmin(orgSlug, targetUser);
    if (!hasOtherAdmin) {
      throw new VError(
        { info: { code: UserError.ORG_FINAL_ADMIN } },
        'Cannot remove only admin',
      );
    }

    const { id: userId } = (await this.findActive({ uid: targetUser }))!;

    try {
      await this.prisma.$transaction([
        this.prisma.orgMember.delete({
          where: {
            orgSlug_userId: {
              userId,
              orgSlug,
            },
          },
        }),
        this.prisma.teamMember.deleteMany({
          where: {
            userId,
            team: {
              orgSlug,
            },
          },
        }),
      ]);
    } catch (e: any) {
      throw new VError(e, 'Failed to remove user from org');
    }
  }

  async listOrgMembers(callingUser: User, orgSlug: Projects.OrgSlug) {
    await this.checkOrgPermission(orgSlug, callingUser.id);

    const [members, invites] = await Promise.all([
      this.prisma.orgMember.findMany({
        where: {
          orgSlug,
          org: {
            active: true,
          },
        },
        select: {
          orgSlug: true,
          role: true,
          user: {
            select: {
              uid: true,
              email: true,
            },
          },
        },
      }),
      await this.prisma.orgInvite.findMany({
        where: {
          orgSlug,
          org: {
            active: true,
          },
        },
        select: {
          orgSlug: true,
          role: true,
          email: true,
        },
      }),
    ]);

    // I'm not sure this is what we want but this ensures the latest invites are at the top
    // of the list, followed by accepted members of the org.
    const existingMembers = members.map((member) => ({
      isInvite: false as const,
      ...member,
    }));
    const nonExistingMembers = invites.map((i) => ({
      isInvite: true as const,
      orgSlug: i.orgSlug,
      role: i.role,
      user: {
        uid: null,
        email: i.email,
      },
    }));
    return (
      [] as (
        | typeof existingMembers[number]
        | typeof nonExistingMembers[number]
      )[]
    )
      .concat(existingMembers, nonExistingMembers)
      .reverse();
  }

  async listOrgs(
    callingUser: User,
  ): Promise<Array<Pick<Org, 'slug' | 'name'> & { isPersonal: boolean }>> {
    const orgs = await this.prisma.orgMember.findMany({
      where: {
        userId: callingUser.id,
        org: {
          active: true,
        },
      },
      select: {
        role: true,
        org: {
          select: {
            slug: true,
            name: true,
            personalForUserId: true,
          },
        },
      },
    });

    return orgs.map((membership) => ({
      slug: membership.org.slug,
      name: membership.org.name,
      isPersonal: !!membership.org.personalForUserId,
    }));
  }

  async deleteOrg(callingUser: User, orgSlug: Projects.OrgSlug) {
    const orgCheck = await this.checkOrgPermission(orgSlug, callingUser.id);

    if (orgCheck.isPersonal) {
      throw new VError(
        { info: { code: UserError.BAD_ORG_PERSONAL } },
        'Personal orgs cannot be deleted',
      );
    }

    if (orgCheck.role !== OrgRole.ADMIN) {
      throw new VError(
        { info: { code: UserError.PERMISSION_DENIED } },
        'Non-admin user attempted to delete org',
      );
    }
    const updatedBy = callingUser.id;

    await this.projectsService.deleteApiKeysByOrg(callingUser, orgSlug);

    await this.prisma.$transaction([
      this.prisma.org.update({
        where: {
          slug: orgSlug,
        },
        data: {
          updatedBy,
          active: false,
          orgMembers: {
            deleteMany: {},
          },
          orgInvites: {
            deleteMany: {},
          },
          projects: {
            updateMany: {
              where: {},
              data: {
                active: false,
                updatedBy,
              },
            },
          },
          teams: {
            updateMany: {
              where: {},
              data: {
                active: false,
                updatedBy,
              },
            },
          },
        },
      }),
      // for some reason, this cannot be done as a nested write above
      this.prisma.teamMember.deleteMany({
        where: {
          team: {
            orgSlug,
          },
        },
      }),
      this.prisma.teamProject.updateMany({
        where: {
          team: {
            orgSlug,
          },
        },
        data: {
          active: false,
          updatedBy,
        },
      }),
      this.prisma.environment.updateMany({
        where: {
          project: {
            orgSlug,
          },
        },
        data: {
          active: false,
          updatedBy,
        },
      }),
      this.prisma.contract.updateMany({
        where: {
          environment: {
            project: {
              orgSlug,
            },
          },
        },
        data: {
          active: false,
          updatedBy,
        },
      }),
    ]);
  }

  async changeOrgRole(
    callingUser: User,
    orgSlug: Projects.OrgSlug,
    targetUser: User['uid'],
    role: OrgRole,
  ) {
    const orgCheck = await this.checkOrgPermission(orgSlug, callingUser.id);

    // does not work on personal orgs
    if (orgCheck.isPersonal) {
      throw new VError(
        { info: { code: UserError.BAD_ORG_PERSONAL } },
        'Roles cannot be managed on personal orgs',
      );
    }

    // can only be run by admins
    if (orgCheck.role !== OrgRole.ADMIN) {
      throw new VError(
        { info: { code: UserError.PERMISSION_DENIED } },
        'Non-admin attempted to change org role',
      );
    }

    let targetMembership: Pick<OrgMember, 'userId' | 'role'>;

    try {
      // find user reference and make sure they are in org
      targetMembership = (await this.prisma.orgMember.findFirst({
        where: {
          user: {
            uid: targetUser,
          },
          orgSlug,
        },
        select: {
          userId: true,
          role: true,
        },
      }))!;
    } catch (e: any) {
      throw new VError(e, 'Failed while looking up target user membership');
    }

    if (!targetMembership) {
      throw new VError(
        { info: { code: UserError.BAD_USER } },
        'UID invalid or user not a member of org',
      );
    }

    // cannot succeed if changing only admin
    try {
      const hasOtherAdmin = await this.hasOtherAdmin(orgSlug, targetUser);
      if (!hasOtherAdmin) {
        throw new VError(
          { info: { code: UserError.ORG_FINAL_ADMIN } },
          'Cannot change role of only admin',
        );
      }
    } catch (e: any) {
      throw new VError(e, 'Failed while checking that there are other admins');
    }

    return await this.prisma.orgMember.update({
      where: {
        orgSlug_userId: {
          orgSlug,
          userId: targetMembership.userId,
        },
      },
      data: {
        role,
        updatedBy: callingUser.id,
      },
      select: {
        orgSlug: true,
        role: true,
        user: {
          select: {
            uid: true,
            email: true,
          },
        },
      },
    });
  }

  private async hasOtherAdmin(
    orgSlug: Projects.OrgSlug,
    userUid: User['uid'],
  ): Promise<boolean> {
    const otherAdmin = await this.prisma.orgMember.findFirst({
      where: {
        orgSlug,
        role: OrgRole.ADMIN,
        user: {
          uid: {
            not: userUid,
          },
        },
      },
    });

    return !!otherAdmin;
  }

  private calculateExpiryDate(expiryMin: number): Date {
    return DateTime.now().plus({ minutes: expiryMin }).toUTC().toJSDate();
  }

  private creationMetadata(user: User) {
    return {
      createdBy: user.id,
      updatedBy: user.id,
    };
  }

  // throws if user does not have permission for org
  private async checkOrgPermission(
    orgSlug: Projects.OrgSlug,
    userId: User['id'],
  ): Promise<{ name: string; role: OrgRole; isPersonal: boolean }> {
    const membership = await this.prisma.orgMember.findUnique({
      where: {
        orgSlug_userId: {
          orgSlug,
          userId,
        },
      },
      select: {
        role: true,
        org: {
          select: {
            name: true,
            personalForUserId: true,
            active: true,
          },
        },
      },
    });

    if (!membership) {
      throw new VError(
        { info: { code: UserError.PERMISSION_DENIED } },
        'User does not have right for this org',
      );
    }

    if (!membership.org?.active) {
      throw new VError({ info: { code: UserError.BAD_ORG } }, 'Org not active');
    }

    return {
      name: membership.org.name,
      role: membership.role,
      isPersonal: !!membership.org.personalForUserId,
    };
  }

  async isOnlyOrgAdmin(userUid: User['uid']): Promise<boolean> {
    return (await this.listOrgsWithOnlyAdmin(userUid)).length > 0;
  }

  async listOrgsWithOnlyAdmin(userUid: User['uid']) {
    // Gets a list of all orgs this user is an admin of, not including their personal org.
    const members = await this.prisma.orgMember.findMany({
      where: {
        user: {
          uid: userUid,
        },
        org: {
          active: true,
          personalForUser: null,
        },
        role: {
          equals: 'ADMIN',
        },
      },
      select: {
        org: {
          select: {
            name: true,
            slug: true,
            orgMembers: {
              select: {
                role: true,
              },
            },
          },
        },
      },
    });

    const orgs: Pick<Org, 'slug' | 'name'>[] = [];
    // Go through each org and determine if it has an admin other than the current user.
    for (const { org } of members) {
      const totalAdmins = org.orgMembers.filter((m) => m.role === 'ADMIN');
      if (totalAdmins.length == 1) {
        const { name, slug } = org;
        orgs.push({
          name,
          slug,
        });
      }
    }
    return orgs;
  }

  async resetPassword(email: string) {
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
    } catch (e: any) {
      console.error(e);

      switch (e.code) {
        case 'auth/user-not-found':
          break;
        case 'auth/missing-email':
        case 'auth/invalid-email':
          throw new VError(
            { info: { code: UserError.INVALID_EMAIL } },
            'Invalid email',
          );
        default:
          throw new VError(
            { info: { code: UserError.SERVER_ERROR } },
            'Something went wrong',
          );
          break;
      }
    }
  }
}

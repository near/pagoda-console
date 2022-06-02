import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { User, Prisma } from '@prisma/client';
import { VError } from 'verror';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.user.create({
      data: {
        ...data,
        teamMembers: {
          create: {
            team: {
              create: {
                name: 'personal',
                ...metadata,
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
    const user = await this.findActive({ uid });

    try {
      // TODO This operation involves deactivating all team members, team's projects etc recursively
      // and should be changed when teams are introduced
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: {
            uid,
          },
          data: {
            active: false,
          },
        }),
        this.prisma.team.updateMany({
          where: {
            teamMembers: {
              every: {
                userId: user.id,
              },
            },
          },
          data: {
            active: false,
            updatedBy: user.id,
          },
        }),
        this.prisma.teamMember.updateMany({
          where: {
            userId: user.id,
          },
          data: {
            active: false,
            updatedBy: user.id,
          },
        }),
        this.prisma.teamProject.updateMany({
          where: {
            createdBy: user.id,
          },
          data: {
            active: false,
            updatedBy: user.id,
          },
        }),
        this.prisma.project.updateMany({
          where: {
            createdBy: user.id,
          },
          data: {
            active: false,
            updatedBy: user.id,
          },
        }),
        this.prisma.environment.updateMany({
          where: {
            createdBy: user.id,
          },
          data: {
            active: false,
            updatedBy: user.id,
          },
        }),
        this.prisma.contract.updateMany({
          where: {
            createdBy: user.id,
          },
          data: {
            active: false,
            updatedBy: user.id,
          },
        }),
      ]);
    } catch (e) {
      throw new VError(e, 'Failed while deactivating user in database');
    }
  }

  // ! this does not update Firebase
  // async updateDetails(uid: User['uid'], { name }: { name: User['name'] }) {
  //   try {
  //     await getAuth().updateUser(uid, {
  //       displayName: name,
  //     });
  //   } catch (e) {
  //     throw new VError(e, 'Failed while updating user details in firebase');
  //   }

  //   try {
  //     await this.prisma.user.update({
  //       where: {
  //         uid,
  //       },
  //       data: {
  //         name,
  //       },
  //     });
  //   } catch (e) {
  //     throw new VError(e, 'Failed while updating user details in database');
  //   }
  // }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { User, Prisma } from '@prisma/client';
import { getAuth } from 'firebase-admin/auth';
import { VError } from 'verror';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...data,
        teamMembers: {
          create: {
            team: {
              create: {
                name: 'personal',
              },
            },
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

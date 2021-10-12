import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { User, Dapp, Prisma } from '@prisma/client';

@Injectable()
export class DappService {
  constructor(private prisma: PrismaService) {}

  async getForUser(userId: User['id']) {
    return this.prisma.dapp.findMany({
      where: {
        userId,
      },
      select: {
        address: true,
      },
    });
  }

  async track(address: Dapp['address'], userId: User['id']) {
    return this.prisma.dapp.create({
      data: {
        address,
        userId,
      },
    });
  }
}

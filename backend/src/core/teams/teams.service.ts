import { Injectable } from '@nestjs/common';
// import { PrismaService } from 'src/prisma.service';
// import { Team, TeamMember, User } from '../../../generated/prisma/core';

@Injectable()
export class TeamsService {
  //   constructor(private prisma: PrismaService) {}
  //   async create(name: string, owner: User): Promise<Team> {
  //     // create Team
  //     // create TeamMember linking User to Team
  //     return this.prisma.team.create({
  //       data: {
  //         name,
  //         TeamMember: {
  //           create: {
  //             userId: owner.id,
  //           },
  //         },
  //       },
  //     });
  //   }
}

// return this.prisma.team.create({
//     data: {
//       name,
//       TeamMember: {
//         create: {
//           user: {
//             connect: {
//               id: owner.id,
//             },
//           },
//         },
//       },
//     },
//   });

import { Controller, Post, Request } from '@nestjs/common';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  // TEMP API FOR TESTING TEAM CREATION
  //   @Post('create')
  //   async create(@Request() req) {
  //     return this.teamsService.create('Personal', req.user.id);
  //     // return { msg: 'hello' };
  //   }
}

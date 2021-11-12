import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpException,
  HttpStatus,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Net } from '@prisma/client';
import { BearerAuthGuard } from 'src/auth/bearer-auth.guard';
import { ProjectsService } from './projects.service';
import { VError } from 'verror';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(BearerAuthGuard)
  @Post('create')
  async create(
    @Request() req,
    @Body('name') name: string,
    @Body('net') net: Net,
  ) {
    return this.projectsService.create({ name, net }, req.user);
  }

  @UseGuards(BearerAuthGuard)
  @HttpCode(204)
  @Post('delete')
  async delete(@Request() req, @Body('id') projectId: number) {
    try {
      return await this.projectsService.delete(req.user, { id: projectId });
    } catch (e) {
      switch (VError.info(e)?.code) {
        case 'PERMISSION_DENIED':
          throw new ForbiddenException();
        case 'BAD_PROJECT':
          throw new BadRequestException();
        default:
          throw e;
      }
    }
  }

  @UseGuards(BearerAuthGuard)
  @Post('addContract')
  async addContract(
    @Request() req,
    @Body('projectId') projectId: number,
    @Body('address') address: string,
  ) {
    try {
      return await this.projectsService.addContract(
        req.user,
        {
          id: projectId,
        },
        address,
      );
    } catch (e) {
      switch (VError.info(e)?.code) {
        case 'PERMISSION_DENIED':
          throw new ForbiddenException();
        case 'BAD_PROJECT':
          throw new BadRequestException();
        default:
          throw e;
      }
    }
  }

  @UseGuards(BearerAuthGuard)
  @HttpCode(204)
  @Post('removeContract')
  async removeContract(@Request() req, @Body('id') contractId: number) {
    try {
      return await this.projectsService.removeContract(req.user, {
        id: contractId,
      });
    } catch (e) {
      switch (VError.info(e)?.code) {
        case 'PERMISSION_DENIED':
          throw new ForbiddenException();
        case 'BAD_CONTRACT':
          throw new BadRequestException();
        default:
          throw e;
      }
    }
  }

  @UseGuards(BearerAuthGuard)
  @Post('getContracts')
  async getContracts(@Request() req, @Body('projectId') projectId: number) {
    try {
      return await this.projectsService.getContracts(req.user, {
        id: projectId,
      });
    } catch (e) {
      switch (VError.info(e)?.code) {
        case 'PERMISSION_DENIED':
          throw new ForbiddenException();
        case 'BAD_PROJECT':
          throw new BadRequestException();
        default:
          throw e;
      }
    }
  }

  @UseGuards(BearerAuthGuard)
  @Post('list')
  async list(@Request() req) {
    return await this.projectsService.list(req.user);
  }
}

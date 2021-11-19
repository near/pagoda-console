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
  async create(@Request() req, @Body('name') name: string) {
    return this.projectsService.create(req.user, name);
  }

  @UseGuards(BearerAuthGuard)
  @HttpCode(204)
  @Post('delete')
  async delete(@Request() req, @Body('slug') slug: string) {
    try {
      return await this.projectsService.delete(req.user, { slug });
    } catch (e) {
      throw mapError(e);
    }
  }

  @UseGuards(BearerAuthGuard)
  @Post('addContract')
  async addContract(
    @Request() req,
    @Body('project') project: string,
    @Body('environment') environment: number,
    @Body('address') address: string,
  ) {
    try {
      return await this.projectsService.addContract(
        req.user,
        project,
        environment,
        address,
      );
    } catch (e) {
      throw mapError(e);
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
      throw mapError(e);
    }
  }

  @UseGuards(BearerAuthGuard)
  @Post('getContracts')
  async getContracts(
    @Request() req,
    @Body('project') project: string,
    @Body('environment') environment: number,
  ) {
    try {
      return await this.projectsService.getContracts(
        req.user,
        project,
        environment,
      );
    } catch (e) {
      throw mapError(e);
    }
  }

  @UseGuards(BearerAuthGuard)
  @Post('list')
  async list(@Request() req) {
    return await this.projectsService.list(req.user);
  }

  @UseGuards(BearerAuthGuard)
  @Post('getEnvironments')
  async getEnvironments(@Request() req, @Body('project') project: string) {
    try {
      return await this.projectsService.getEnvironments(req.user, {
        slug: project,
      });
    } catch (e) {
      throw mapError(e);
    }
  }

  @UseGuards(BearerAuthGuard)
  @Post('getEnvironmentDetails')
  async getEnvironmentDetails(
    @Request() req,
    @Body('project') project: string,
    @Body('environment') environment: number,
  ) {
    try {
      return await this.projectsService.getEnvironmentDetails(
        req.user,
        project,
        environment,
      );
    } catch (e) {
      throw mapError(e);
    }
  }
}

function mapError(e: Error) {
  // TODO only log in dev
  console.error(e);
  switch (VError.info(e)?.code) {
    case 'PERMISSION_DENIED':
      return new ForbiddenException();
    case 'BAD_PROJECT':
    case 'BAD_ENVIRONMENT':
    case 'BAD_CONTRACT':
      return new BadRequestException();
    default:
      return e;
  }
}

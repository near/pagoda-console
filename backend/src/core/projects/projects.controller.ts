import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ConflictException,
} from '@nestjs/common';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import { ProjectsService } from './projects.service';
import { VError } from 'verror';
import { ZodValidationPipe } from 'src/pipes/ZodValidationPipe';
import { Projects } from '@pc/common/types/core';
import { Api } from '@pc/common/types/api';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('create')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Projects.mutation.inputs.create))
  async create(
    @Request() req,
    @Body() { org, name, tutorial }: Api.Mutation.Input<'/projects/create'>,
  ): Promise<Api.Mutation.Output<'/projects/create'>> {
    try {
      return await this.projectsService.create(
        req.user,
        name.trim(),
        org,
        tutorial,
      );
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('ejectTutorial')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Projects.mutation.inputs.ejectTutorial))
  async ejectTutorial(
    @Request() req,
    @Body() { slug }: Api.Mutation.Input<'/projects/ejectTutorial'>,
  ): Promise<Api.Mutation.Output<'/projects/ejectTutorial'>> {
    try {
      return await this.projectsService.ejectTutorial(req.user, { slug });
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('delete')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Projects.mutation.inputs.delete))
  async delete(
    @Request() req,
    @Body() { slug }: Api.Mutation.Input<'/projects/delete'>,
  ): Promise<Api.Mutation.Output<'/projects/delete'>> {
    try {
      return await this.projectsService.delete(req.user, { slug });
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('getDetails')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Projects.query.inputs.getDetails))
  async getDetails(
    @Request() req,
    @Body() { slug }: Api.Query.Input<'/projects/getDetails'>,
  ): Promise<Api.Query.Output<'/projects/getDetails'>> {
    try {
      return await this.projectsService.getProjectDetails(req.user, { slug });
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('addContract')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Projects.mutation.inputs.addContract))
  async addContract(
    @Request() req,
    @Body()
    {
      project,
      environment,
      address,
    }: Api.Mutation.Input<'/projects/addContract'>,
  ): Promise<Api.Mutation.Output<'/projects/addContract'>> {
    try {
      return await this.projectsService.addContract(
        req.user,
        project,
        environment,
        address,
      );
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('removeContract')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Projects.mutation.inputs.removeContract))
  async removeContract(
    @Request() req,
    @Body() { slug }: Api.Mutation.Input<'/projects/removeContract'>,
  ): Promise<Api.Mutation.Output<'/projects/removeContract'>> {
    try {
      return await this.projectsService.removeContract(req.user, {
        slug,
      });
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('getContracts')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Projects.query.inputs.getContracts))
  async getContracts(
    @Request() req,
    @Body() { project, environment }: Api.Query.Input<'/projects/getContracts'>,
  ): Promise<Api.Query.Output<'/projects/getContracts'>> {
    try {
      return await this.projectsService.getContracts(
        req.user,
        project,
        environment,
      );
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('getContract')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Projects.query.inputs.getContract))
  async getContract(
    @Request() req,
    @Body() { slug }: Api.Query.Input<'/projects/getContract'>,
  ): Promise<Api.Query.Output<'/projects/getContract'>> {
    try {
      return await this.projectsService.getContract(req.user, slug);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('list')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Projects.query.inputs.list))
  async list(
    @Request() req,
    @Body() _: Api.Query.Input<'/projects/list'>,
  ): Promise<Api.Query.Output<'/projects/list'>> {
    return await this.projectsService.list(req.user);
  }

  @Post('getEnvironments')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Projects.query.inputs.getEnvironments))
  async getEnvironments(
    @Request() req,
    @Body() { project }: Api.Query.Input<'/projects/getEnvironments'>,
  ): Promise<Api.Query.Output<'/projects/getEnvironments'>> {
    try {
      return await this.projectsService.getEnvironments(req.user, {
        slug: project,
      });
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('getKeys')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Projects.query.inputs.getKeys))
  async getKeys(
    @Request() req,
    @Body() { project }: Api.Query.Input<'/projects/getKeys'>,
  ): Promise<Api.Query.Output<'/projects/getKeys'>> {
    try {
      return await this.projectsService.getKeys(req.user, project);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('rotateKey')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Projects.mutation.inputs.rotateKey))
  async rotateKey(
    @Request() req,
    @Body() { slug }: Api.Mutation.Input<'/projects/rotateKey'>,
  ): Promise<Api.Mutation.Output<'/projects/rotateKey'>> {
    try {
      return await this.projectsService.rotateKey(req.user, slug);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('generateKey')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Projects.mutation.inputs.generateKey))
  async generateKey(
    @Request() req,
    @Body()
    key: Api.Mutation.Input<'/projects/generateKey'>,
  ): Promise<Api.Mutation.Output<'/projects/generateKey'>> {
    try {
      const { project, description } = key;
      if (key.type === 'KEY') {
        return await this.projectsService.generateKey(
          req.user,
          project,
          description,
        );
      }

      const { issuer, publicKey } = key;
      return await this.projectsService.addJwtKey(
        req.user,
        project,
        description,
        issuer,
        publicKey,
      );
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('deleteKey')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Projects.mutation.inputs.deleteKey))
  async deleteKey(
    @Request() req,
    @Body() { slug }: Api.Mutation.Input<'/projects/deleteKey'>,
  ): Promise<Api.Mutation.Output<'/projects/deleteKey'>> {
    try {
      return await this.projectsService.deleteKey(req.user, slug);
    } catch (e: any) {
      throw mapError(e);
    }
  }
}

function mapError(e: Error) {
  // TODO log in dev
  // console.error(e);
  const errorInfo = VError.info(e);
  switch (errorInfo?.code) {
    case 'PERMISSION_DENIED':
      return new ForbiddenException();
    case 'BAD_PROJECT':
    case 'BAD_ENVIRONMENT':
    case 'BAD_CONTRACT':
    case 'BAD_KEY':
    case 'BAD_ORG':
      return new BadRequestException();
    case 'NOT_FOUND':
      return new BadRequestException(errorInfo.response);
    // TODO consolidate CONFLICT errors
    case 'NAME_CONFLICT':
      return new ConflictException('Name already exists');
    // CONFLICT is meant to be a generic error with a passthu stored in errorInfo.response. It was meant to be something that could be shared across modules.
    case 'CONFLICT':
      return new ConflictException(errorInfo.response);
    default:
      return e;
  }
}

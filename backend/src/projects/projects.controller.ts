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
  UsePipes,
} from '@nestjs/common';
import { BearerAuthGuard } from 'src/auth/bearer-auth.guard';
import { ProjectsService } from './projects.service';
import { VError } from 'verror';
import {
  AddContractDto,
  AddContractSchema,
  CreateProjectDto,
  CreateProjectSchema,
  DeleteProjectDto,
  DeleteProjectSchema,
  GetContractsDto,
  GetContractsSchema,
  GetEnvironmentsDetailsDto,
  GetEnvironmentsDetailsSchema,
  GetEnvironmentsDto,
  GetEnvironmentsSchema,
  RemoveContractDto,
  RemoveContractSchema,
} from './dto';
import { JoiValidationPipe } from 'src/pipes/JoiValidationPipe';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('create')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(CreateProjectSchema))
  async create(@Request() req, @Body() { name }: CreateProjectDto) {
    return this.projectsService.create(req.user, name);
  }

  @Post('delete')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(DeleteProjectSchema))
  async delete(@Request() req, @Body() { slug }: DeleteProjectDto) {
    try {
      return await this.projectsService.delete(req.user, { slug });
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('addContract')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(AddContractSchema))
  async addContract(
    @Request() req,
    @Body() { project, environment, address }: AddContractDto,
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

  @Post('removeContract')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(RemoveContractSchema))
  async removeContract(@Request() req, @Body() { id }: RemoveContractDto) {
    try {
      return await this.projectsService.removeContract(req.user, {
        id,
      });
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('getContracts')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(GetContractsSchema))
  async getContracts(
    @Request() req,
    @Body() { project, environment }: GetContractsDto,
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

  @Post('list')
  @UseGuards(BearerAuthGuard)
  async list(@Request() req) {
    return await this.projectsService.list(req.user);
  }

  @Post('getEnvironments')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(GetEnvironmentsSchema))
  async getEnvironments(
    @Request() req,
    @Body() { project }: GetEnvironmentsDto,
  ) {
    try {
      return await this.projectsService.getEnvironments(req.user, {
        slug: project,
      });
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('getEnvironmentDetails')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(GetEnvironmentsDetailsSchema))
  async getEnvironmentDetails(
    @Request() req,
    @Body() { project, environment }: GetEnvironmentsDetailsDto,
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
  // TODO log in dev
  // console.error(e);
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

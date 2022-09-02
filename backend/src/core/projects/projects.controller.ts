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
import {
  AddContractDto,
  AddContractSchema,
  CreateProjectDto,
  CreateProjectSchema,
  DeleteKeyDto,
  DeleteKeySchema,
  DeleteProjectDto,
  DeleteProjectSchema,
  EjectTutorialProjectDto,
  EjectTutorialProjectSchema,
  GenerateKeyDto,
  GenerateKeySchema,
  GetContractDto,
  GetContractSchema,
  GetContractsDto,
  GetContractsSchema,
  GetEnvironmentsDetailsDto,
  GetEnvironmentsDetailsSchema,
  GetEnvironmentsDto,
  GetEnvironmentsSchema,
  GetKeysDto,
  GetKeysSchema,
  GetProjectDetailsDto,
  GetProjectDetailsSchema,
  GetTransactionsDto,
  GetTransactionsSchema,
  RemoveContractDto,
  RemoveContractSchema,
  RotateKeyDto,
  RotateKeySchema,
} from './dto';
import { JoiValidationPipe } from 'src/pipes/JoiValidationPipe';
import { IndexerService } from '../indexer.service';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly indexerService: IndexerService,
  ) {}

  @Post('create')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(CreateProjectSchema))
  async create(
    @Request() req,
    @Body() { org, name, tutorial }: CreateProjectDto,
  ) {
    try {
      return await this.projectsService.create(
        req.user,
        name.trim(),
        org,
        tutorial,
      );
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('ejectTutorial')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(EjectTutorialProjectSchema))
  async ejectTutorial(
    @Request() req,
    @Body() { slug }: EjectTutorialProjectDto,
  ) {
    try {
      return await this.projectsService.ejectTutorial(req.user, { slug });
    } catch (e) {
      throw mapError(e);
    }
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

  @Post('getDetails')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(GetProjectDetailsSchema))
  async getDetails(@Request() req, @Body() { slug }: GetProjectDetailsDto) {
    try {
      return await this.projectsService.getProjectDetails(req.user, { slug });
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
  async removeContract(@Request() req, @Body() { slug }: RemoveContractDto) {
    try {
      return await this.projectsService.removeContract(req.user, {
        slug,
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

  @Post('getContract')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(GetContractSchema))
  async getContract(@Request() req, @Body() { slug }: GetContractDto) {
    try {
      return await this.projectsService.getContract(req.user, slug);
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

  @Post('getKeys')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(GetKeysSchema))
  async getKeys(@Request() req, @Body() { project }: GetKeysDto) {
    try {
      return await this.projectsService.getKeys(req.user, project);
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('rotateKey')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(RotateKeySchema))
  async rotateKey(@Request() req, @Body() { slug }: RotateKeyDto) {
    try {
      return await this.projectsService.rotateKey(req.user, slug);
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('generateKey')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(GenerateKeySchema))
  async generateKey(
    @Request() req,
    @Body() { project, description }: GenerateKeyDto,
  ) {
    try {
      return await this.projectsService.generateKey(
        req.user,
        project,
        description,
      );
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('deleteKey')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(DeleteKeySchema))
  async deleteKey(@Request() req, @Body() { slug }: DeleteKeyDto) {
    try {
      return await this.projectsService.deleteKey(req.user, slug);
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('getTransactions')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(GetTransactionsSchema))
  async getTransactions(@Body() { contracts, net }: GetTransactionsDto) {
    return this.indexerService.fetchRecentTransactions(contracts, net);
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

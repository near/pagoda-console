import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Post,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { DateTime } from 'luxon';

import { BearerAuthGuard } from 'src/core/auth/bearer-auth.guard';
import { JoiValidationPipe } from 'src/pipes/JoiValidationPipe';
import { VError } from 'verror';
import { ProjectsService } from '@/src/core/projects/projects.service';
import { RpcStatsService } from './rpcstats.service';
import {
  EndpointMetricsSchema,
  EndpointMetricsDto,
  EndpointMetricsResponseDto,
} from './dto';

@Controller('rpcstats')
export class RpcStatsController {
  static MAX_RECORDS = 100;

  constructor(
    private readonly rpcStatsService: RpcStatsService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Post('endpointMetrics')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(EndpointMetricsSchema))
  async endpointMetrics(
    @Request() req,
    @Body()
    {
      projectSlug,
      environmentSubId,
      startDateTime,
      endDateTime,
      dateTimeResolution,
      grouping,
    }: EndpointMetricsDto,
  ): Promise<EndpointMetricsResponseDto> {
    try {
      // When there is a project passed in, check that the user has access to the project
      // await this.projectService.checkUserPermission(
      //   user.id,
      //   projectSlug,
      //   environmentSubId,
      // );
      // When there is an Api Key passed in, check that the user has access to the key

      const environment = await this.projectsService.getEnvironmentDetails(
        req.user,
        projectSlug,
        environmentSubId,
      );

      const allApiKeyConsumerNames = [];
      const projects = await this.projectsService.list(req.user);
      const keyPromises = [];
      projects.forEach((project) => {
        keyPromises.push(
          this.projectsService.getKeys(req.user, project.slug).then((keys) => {
            keys.forEach((k) =>
              allApiKeyConsumerNames.push(k.kongConsumerName),
            );
          }),
        );
      });

      await Promise.all(keyPromises);

      return await this.rpcStatsService.endpointMetrics(
        environment.net,
        allApiKeyConsumerNames,
        DateTime.fromISO(startDateTime),
        DateTime.fromISO(endDateTime),
        dateTimeResolution,
        grouping,
      );
    } catch (e) {
      throw mapError(e);
    }
  }
}

function mapError(e: Error) {
  switch (VError.info(e)?.code) {
    case 'PERMISSION_DENIED':
      return new ForbiddenException();
    case 'BAD_DESTINATION':
    case 'BAD_ALERT':
      return new BadRequestException();
    default:
      return e;
  }
}

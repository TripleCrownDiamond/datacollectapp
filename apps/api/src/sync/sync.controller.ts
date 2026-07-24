import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SyncService } from './sync.service.js';
import { OrgScopeGuard } from '../auth/org-scope.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@Controller('sync')
@UseGuards(AuthGuard('jwt'), OrgScopeGuard)
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Post('submissions')
  @HttpCode(HttpStatus.OK)
  async pushSubmissions(
    @CurrentUser() user: { orgId: string; id: string },
    @Body()
    body: {
      deviceId: string;
      submissions: Array<{
        uuid: string;
        formId: string;
        formVersion: number;
        data: Record<string, unknown>;
        meta?: Record<string, unknown>;
      }>;
    },
  ) {
    if (!body.deviceId) {
      return { error: 'deviceId is required' };
    }

    const MAX_BATCH = 50;
    const batch = body.submissions?.slice(0, MAX_BATCH) ?? [];

    return this.syncService.pushSubmissions(user.orgId, user.id, body.deviceId, batch);
  }

  @Put('submissions/:uuid/revision')
  @HttpCode(HttpStatus.OK)
  async reviseSubmission(
    @CurrentUser() user: { orgId: string },
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body()
    body: {
      baseRevision: string;
      data: Record<string, unknown>;
      meta?: Record<string, unknown>;
    },
  ) {
    return this.syncService.reviseSubmission(user.orgId, uuid, body);
  }

  @Get('updates')
  async getUpdates(
    @CurrentUser() user: { orgId: string; id: string },
    @Query('deviceId') deviceId: string,
    @Query('since') since?: string,
  ) {
    if (!deviceId) {
      return { error: 'deviceId query parameter is required' };
    }

    return this.syncService.getUpdates(user.orgId, user.id, deviceId, since);
  }

  @Get('projects/:projectId/package')
  async getProjectPackage(
    @CurrentUser() user: { orgId: string },
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    return this.syncService.getProjectPackage(user.orgId, projectId);
  }
}

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubmissionsService } from './submissions.service.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { OrgScopeGuard } from '../auth/org-scope.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

const EDITOR_ROLES = ['admin', 'project_manager', 'supervisor', 'qa'] as const;
const ANY_ROLE = ['admin', 'project_manager', 'supervisor', 'qa', 'collector', 'analyst', 'observer'] as const;

@Controller()
@UseGuards(AuthGuard('jwt'), OrgScopeGuard)
export class SubmissionsController {
  constructor(private submissionsService: SubmissionsService) {}

  @Get('projects/:projectId/submissions')
  async listSubmissions(
    @CurrentUser() user: { orgId: string; id: string; role: string },
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('pageSize') pageSize?: string,
    @Query('cursor') cursor?: string,
    @Query('formId') formId?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('submittedBy') submittedBy?: string,
  ) {
    return this.submissionsService.listSubmissions(user.orgId, projectId, user.id, user.role, {
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      cursor,
      formId,
      status,
      from,
      to,
      submittedBy,
    });
  }

  @Get('projects/:projectId/submissions/stats')
  async getSubmissionStats(
    @CurrentUser() user: { orgId: string },
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    return this.submissionsService.getSubmissionStats(user.orgId, projectId);
  }

  @Get('submissions/:id')
  async getSubmission(
    @CurrentUser() user: { orgId: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.submissionsService.getSubmission(user.orgId, id);
  }

  @Post('submissions/:id/review')
  @Roles(...EDITOR_ROLES)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  async reviewSubmission(
    @CurrentUser() user: { orgId: string; id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { action: 'approve' | 'reject'; reason?: string },
  ) {
    return this.submissionsService.reviewSubmission(user.orgId, id, user.id, dto);
  }

  @Delete('submissions/:id')
  @Roles('admin', 'project_manager')
  @UseGuards(RolesGuard)
  async deleteSubmission(
    @CurrentUser() user: { orgId: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.submissionsService.deleteSubmission(user.orgId, id);
  }
}

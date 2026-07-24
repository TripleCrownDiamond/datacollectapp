import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Body,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FormsService } from './forms.service.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { OrgScopeGuard } from '../auth/org-scope.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

/** Roles allowed to author and publish forms (permission `form.publish`). */
const EDITOR_ROLES = ['admin', 'project_manager'] as const;

/**
 * Forms nested under a project: listing and creation.
 * See docs/11_API.md §6.
 */
@Controller('projects/:projectId/forms')
@UseGuards(AuthGuard('jwt'), OrgScopeGuard)
export class ProjectFormsController {
  constructor(private formsService: FormsService) {}

  @Get()
  async listForms(
    @CurrentUser() user: { orgId: string },
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    return this.formsService.listForms(user.orgId, projectId);
  }

  @Post()
  @Roles(...EDITOR_ROLES)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async createForm(
    @CurrentUser() user: { orgId: string; id: string },
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: { name: string; draftSchema?: unknown },
  ) {
    return this.formsService.createForm(user.orgId, projectId, user.id, dto);
  }
}

/**
 * Form-scoped operations: detail, draft autosave, publication, versions.
 * A published version is immutable — publishing always creates version n+1.
 */
@Controller('forms')
@UseGuards(AuthGuard('jwt'), OrgScopeGuard)
export class FormsController {
  constructor(private formsService: FormsService) {}

  @Get(':id')
  async getForm(
    @CurrentUser() user: { orgId: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.formsService.getForm(user.orgId, id);
  }

  @Patch(':id')
  @Roles(...EDITOR_ROLES)
  @UseGuards(RolesGuard)
  async updateForm(
    @CurrentUser() user: { orgId: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { name?: string; status?: string; draftSchema?: unknown },
  ) {
    return this.formsService.updateForm(user.orgId, id, dto);
  }

  @Post(':id/publish')
  @Roles(...EDITOR_ROLES)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async publishForm(
    @CurrentUser() user: { orgId: string; id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.formsService.publishForm(user.orgId, id, user.id);
  }

  @Post(':id/duplicate')
  @Roles(...EDITOR_ROLES)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async duplicateForm(
    @CurrentUser() user: { orgId: string; id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.formsService.duplicateForm(user.orgId, id, user.id);
  }

  @Get(':id/versions')
  async listVersions(
    @CurrentUser() user: { orgId: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.formsService.listVersions(user.orgId, id);
  }

  @Get(':id/versions/:version')
  async getVersion(
    @CurrentUser() user: { orgId: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Param('version', ParseIntPipe) version: number,
  ) {
    return this.formsService.getVersion(user.orgId, id, version);
  }

  @Get(':id/assignments')
  async getAssignments(
    @CurrentUser() user: { orgId: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.formsService.getAssignments(user.orgId, id);
  }

  @Put(':id/assignments')
  @Roles(...EDITOR_ROLES)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  async setAssignments(
    @CurrentUser() user: { orgId: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { userIds?: string[]; all?: boolean },
  ) {
    return this.formsService.setAssignments(user.orgId, id, dto);
  }
}

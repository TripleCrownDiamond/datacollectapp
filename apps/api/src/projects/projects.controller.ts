import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { OrgScopeGuard } from '../auth/org-scope.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@Controller('projects')
@UseGuards(AuthGuard('jwt'), OrgScopeGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  async listProjects(@CurrentUser() user: { orgId: string; id: string; role: string }) {
    return this.projectsService.listProjects(user.orgId, user.id, user.role);
  }

  @Post()
  @Roles('admin', 'project_manager')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async createProject(
    @CurrentUser() user: { orgId: string; id: string },
    @Body() dto: { name: string; description?: string; languages?: string[]; timezone?: string },
  ) {
    return this.projectsService.createProject(user.orgId, user.id, dto);
  }

  @Get(':id')
  async getProject(
    @CurrentUser() user: { orgId: string },
    @Param('id') id: string,
  ) {
    return this.projectsService.getProject(user.orgId, id);
  }

  @Patch(':id')
  @Roles('admin', 'project_manager')
  @UseGuards(RolesGuard)
  async updateProject(
    @CurrentUser() user: { orgId: string },
    @Param('id') id: string,
    @Body() dto: {
      name?: string;
      description?: string;
      status?: string;
      languages?: string[];
      timezone?: string;
      settings?: Record<string, unknown>;
    },
  ) {
    return this.projectsService.updateProject(user.orgId, id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'project_manager')
  @UseGuards(RolesGuard)
  async deleteProject(
    @CurrentUser() user: { orgId: string; id: string },
    @Param('id') id: string,
  ) {
    return this.projectsService.deleteProject(user.orgId, id, user.id);
  }
}

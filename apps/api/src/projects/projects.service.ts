import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async listProjects(orgId: string, userId: string, userRole: string) {
    const where: Record<string, unknown> = {
      organizationId: orgId,
      deletedAt: null,
    };

    if (userRole === 'collector') {
      where.projectMembers = {
        some: { userId },
      };
    }

    const projects = await this.prisma.project.findMany({
      where,
      include: {
        _count: {
          select: { forms: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map(
      (p: {
        id: string;
        name: string;
        description: string | null;
        status: string;
        languages: string[];
        timezone: string;
        settings: Prisma.JsonValue;
        _count: { forms: number };
        createdAt: Date;
        updatedAt: Date;
      }) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        languages: p.languages,
        timezone: p.timezone,
        settings: p.settings,
        formCount: p._count.forms,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }),
    );
  }

  async createProject(
    orgId: string,
    userId: string,
    data: {
      name: string;
      description?: string;
      languages?: string[];
      timezone?: string;
    },
  ) {
    const project = await this.prisma.project.create({
      data: {
        organizationId: orgId,
        name: data.name,
        description: data.description,
        languages: data.languages || ['fr'],
        timezone: data.timezone || 'UTC',
        createdById: userId,
      },
    });

    return project;
  }

  async getProject(orgId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: orgId, deletedAt: null },
      include: {
        _count: {
          select: { forms: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      languages: project.languages,
      timezone: project.timezone,
      settings: project.settings,
      formCount: project._count.forms,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  async updateProject(
    orgId: string,
    projectId: string,
    data: {
      name?: string;
      description?: string;
      status?: string;
      languages?: string[];
      timezone?: string;
      settings?: Record<string, unknown>;
    },
  ) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: orgId, deletedAt: null },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status && { status: data.status }),
        ...(data.languages && { languages: data.languages }),
        ...(data.timezone && { timezone: data.timezone }),
        ...(data.settings && { settings: data.settings as Prisma.InputJsonValue }),
      },
    });

    return updated;
  }

  async deleteProject(orgId: string, projectId: string, _userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: orgId, deletedAt: null },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Project deleted successfully' };
  }
}

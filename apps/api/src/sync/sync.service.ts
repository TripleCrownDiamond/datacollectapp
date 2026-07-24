import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '@prisma/client';

export interface SyncResult {
  uuid: string;
  status: 'accepted' | 'already_synced' | 'rejected_invalid';
  details?: string;
}

@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  async pushSubmissions(
    orgId: string,
    userId: string,
    deviceId: string,
    submissions: Array<{
      uuid: string;
      formId: string;
      formVersion: number;
      data: Record<string, unknown>;
      meta?: Record<string, unknown>;
    }>,
  ): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const sub of submissions) {
      try {
        const existing = await this.prisma.submission.findUnique({
          where: { id: sub.uuid },
          select: { id: true, status: true },
        });

        if (existing) {
          results.push({ uuid: sub.uuid, status: 'already_synced' });
          continue;
        }

        const form = await this.prisma.form.findFirst({
          where: { id: sub.formId, organizationId: orgId, deletedAt: null },
          select: { id: true, projectId: true },
        });

        if (!form) {
          results.push({
            uuid: sub.uuid,
            status: 'rejected_invalid',
            details: `Form ${sub.formId} not found or inactive`,
          });
          continue;
        }

        const version = await this.prisma.formVersion.findFirst({
          where: { formId: sub.formId, version: sub.formVersion },
          select: { id: true },
        });

        if (!version) {
          results.push({
            uuid: sub.uuid,
            status: 'rejected_invalid',
            details: `Version ${sub.formVersion} of form ${sub.formId} not found`,
          });
          continue;
        }

        const geom = this.extractGeom(sub.data);

        await this.prisma.submission.create({
          data: {
            id: sub.uuid,
            organizationId: orgId,
            projectId: form.projectId,
            formId: sub.formId,
            formVersion: sub.formVersion,
            submittedById: userId,
            data: sub.data as Prisma.InputJsonValue,
            meta: (sub.meta ?? {}) as Prisma.InputJsonValue,
            status: 'submitted',
            geom,
          },
        });

        await this.upsertSyncCursor(orgId, userId, deviceId);
        results.push({ uuid: sub.uuid, status: 'accepted' });
      } catch (err) {
        results.push({
          uuid: sub.uuid,
          status: 'rejected_invalid',
          details: (err as Error).message,
        });
      }
    }

    return results;
  }

  async reviseSubmission(
    orgId: string,
    submissionId: string,
    data: {
      baseRevision: string;
      data: Record<string, unknown>;
      meta?: Record<string, unknown>;
    },
  ) {
    const submission = await this.prisma.submission.findFirst({
      where: { id: submissionId, organizationId: orgId, deletedAt: null },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.revision > 1) {
      const currentRevision = await this.prisma.submissionRevision.findFirst({
        where: { submissionId, revision: submission.revision },
        select: { id: true },
      });

      if (!currentRevision) {
        return {
          status: 'conflict',
          message: 'Base revision does not match current revision — conflict detected',
        };
      }
    }

    const nextRevision = submission.revision + 1;

    await this.prisma.submissionRevision.create({
      data: {
        organizationId: orgId,
        submissionId,
        revision: submission.revision,
        data: submission.data as Prisma.InputJsonValue,
        meta: (submission.meta ?? {}) as Prisma.InputJsonValue,
      },
    });

    await this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        data: data.data as Prisma.InputJsonValue,
        meta: (data.meta ?? {}) as Prisma.InputJsonValue,
        revision: nextRevision,
        status: 'submitted',
        reviewedById: null,
        reviewedAt: null,
        rejectionReason: null,
      },
    });

    return { status: 'accepted', revision: nextRevision };
  }

  async getUpdates(
    orgId: string,
    userId: string,
    deviceId: string,
    since?: string,
  ) {
    const cursor = await this.prisma.syncCursor.findUnique({
      where: { userId_deviceId: { userId, deviceId } },
    });

    const sinceDate = since ? new Date(since) : cursor?.lastPulledAt ?? new Date(0);

    const [forms, reviews, assignments] = await Promise.all([
      this.prisma.formVersion.findMany({
        where: {
          organizationId: orgId,
          publishedAt: { gt: sinceDate },
        },
        include: {
          form: { select: { id: true, projectId: true, name: true } },
        },
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.submission.findMany({
        where: {
          organizationId: orgId,
          submittedById: userId,
          reviewedAt: { gt: sinceDate },
          status: { in: ['approved', 'rejected'] },
        },
        select: {
          id: true,
          status: true,
          rejectionReason: true,
          reviewedAt: true,
        },
      }),
      this.prisma.formAssignment.findMany({
        where: { organizationId: orgId, userId },
        include: {
          form: { select: { id: true, projectId: true, name: true } },
        },
      }),
    ]);

    await this.prisma.syncCursor.upsert({
      where: { userId_deviceId: { userId, deviceId } },
      create: { userId, deviceId, lastPulledAt: new Date() },
      update: { lastPulledAt: new Date() },
    });

    return {
      forms: forms.map((fv) => ({
        formId: fv.form.id,
        projectId: fv.form.projectId,
        name: fv.form.name,
        version: fv.version,
        schema: fv.schema,
        publishedAt: fv.publishedAt,
      })),
      reviews: reviews.map((r) => ({
        submissionId: r.id,
        status: r.status,
        reason: r.rejectionReason,
        reviewedAt: r.reviewedAt,
      })),
      assignments: assignments.map((a) => ({
        formId: a.form.id,
        projectId: a.form.projectId,
        name: a.form.name,
      })),
      cursor: new Date().toISOString(),
    };
  }

  async getProjectPackage(orgId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: orgId, deletedAt: null },
      select: { id: true, name: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const [forms, versions] = await Promise.all([
      this.prisma.form.findMany({
        where: { organizationId: orgId, projectId, deletedAt: null, status: 'published' },
        select: { id: true, name: true, currentVersion: true },
      }),
      this.prisma.formVersion.findMany({
        where: {
          organizationId: orgId,
          form: { projectId, organizationId: orgId, deletedAt: null },
        },
        select: {
          formId: true,
          version: true,
          schema: true,
          publishedAt: true,
        },
        orderBy: { version: 'desc' },
      }),
    ]);

    const formIds = new Set(forms.map((f) => f.id));
    const relevantVersions = versions.filter((v) => formIds.has(v.formId));

    return {
      projectId: project.id,
      projectName: project.name,
      forms: forms.map((f) => ({
        id: f.id,
        name: f.name,
        currentVersion: f.currentVersion,
        versions: relevantVersions
          .filter((v) => v.formId === f.id)
          .map((v) => ({
            version: v.version,
            schema: v.schema,
            publishedAt: v.publishedAt,
          })),
      })),
    };
  }

  private async upsertSyncCursor(orgId: string, userId: string, deviceId: string) {
    await this.prisma.syncCursor.upsert({
      where: { userId_deviceId: { userId, deviceId } },
      create: { userId, deviceId },
      update: { lastPushedAt: new Date() },
    });
  }

  private extractGeom(data: Record<string, unknown>): string | null {
    for (const val of Object.values(data)) {
      if (val && typeof val === 'object' && 'latitude' in val && 'longitude' in val) {
        const { latitude, longitude, accuracy } = val as {
          latitude: number;
          longitude: number;
          accuracy?: number;
        };
        return JSON.stringify({
          type: 'Point',
          coordinates: [longitude, latitude],
          accuracy,
        });
      }
    }
    return null;
  }
}

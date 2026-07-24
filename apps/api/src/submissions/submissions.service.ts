import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '@prisma/client';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  async listSubmissions(
    orgId: string,
    projectId: string,
    userId: string,
    userRole: string,
    query: {
      pageSize?: number;
      cursor?: string;
      formId?: string;
      status?: string;
      from?: string;
      to?: string;
      submittedBy?: string;
    },
  ) {
    await this.assertProject(orgId, projectId);

    const pageSize = Math.min(query.pageSize ?? 50, 100);
    const where: Record<string, unknown> = {
      organizationId: orgId,
      projectId,
      deletedAt: null,
    };

    if (userRole === 'collector') {
      where.submittedById = userId;
    }
    if (query.formId) where.formId = query.formId;
    if (query.status) where.status = query.status;
    if (query.submittedBy) where.submittedById = query.submittedBy;
    if (query.from || query.to) {
      const createdAt: Record<string, string> = {};
      if (query.from) createdAt.gte = new Date(query.from).toISOString();
      if (query.to) createdAt.lte = new Date(query.to).toISOString();
      where.createdAt = createdAt;
    }
    if (query.cursor) {
      where.id = { lt: query.cursor };
    }

    const submissions = await this.prisma.submission.findMany({
      where: where as Prisma.SubmissionWhereInput,
      take: pageSize + 1,
      orderBy: { createdAt: 'desc' },
      include: {
        submittedBy: { select: { id: true, fullName: true } },
        _count: { select: { attachments: true, revisions: true } },
      },
    });

    const hasMore = submissions.length > pageSize;
    if (hasMore) submissions.pop();

    return {
      data: submissions.map((s) => ({
        id: s.id,
        formId: s.formId,
        formVersion: s.formVersion,
        status: s.status,
        revision: s.revision,
        submittedBy: s.submittedBy,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        attachmentCount: s._count.attachments,
        revisionCount: s._count.revisions,
      })),
      meta: {
        nextCursor: hasMore ? submissions[submissions.length - 1]?.id : undefined,
      },
    };
  }

  async getSubmission(orgId: string, submissionId: string) {
    const submission = await this.prisma.submission.findFirst({
      where: { id: submissionId, organizationId: orgId, deletedAt: null },
      include: {
        submittedBy: { select: { id: true, fullName: true } },
        reviewedBy: { select: { id: true, fullName: true } },
        revisions: {
          orderBy: { revision: 'desc' },
          select: { revision: true, createdAt: true },
        },
        attachments: {
          select: {
            id: true,
            questionName: true,
            fileName: true,
            mimeType: true,
            sizeBytes: true,
            status: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return submission;
  }

  async reviewSubmission(
    orgId: string,
    submissionId: string,
    userId: string,
    data: { action: 'approve' | 'reject'; reason?: string },
  ) {
    const submission = await this.prisma.submission.findFirst({
      where: { id: submissionId, organizationId: orgId, deletedAt: null },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (data.action === 'reject' && !data.reason) {
      throw new UnprocessableEntityException({
        message: 'Rejection reason is required',
        details: [{ path: 'reason', rule: 'required', message: 'A reason must be provided when rejecting' }],
      });
    }

    const newStatus = data.action === 'approve' ? 'approved' : 'rejected';

    return this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: newStatus,
        reviewedById: userId,
        reviewedAt: new Date(),
        rejectionReason: data.reason ?? null,
      },
    });
  }

  async getSubmissionStats(orgId: string, projectId: string) {
    await this.assertProject(orgId, projectId);

    const [total, byStatus, recent] = await Promise.all([
      this.prisma.submission.count({
        where: { organizationId: orgId, projectId, deletedAt: null },
      }),
      this.prisma.submission.groupBy({
        by: ['status'],
        where: { organizationId: orgId, projectId, deletedAt: null },
        _count: { id: true },
      }),
      this.prisma.submission.findMany({
        where: { organizationId: orgId, projectId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 7,
        select: { createdAt: true, status: true },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce(
        (acc, s) => {
          acc[s.status] = s._count.id;
          return acc;
        },
        {} as Record<string, number>,
      ),
      recentDays: recent.map((r) => ({
        date: r.createdAt.toISOString().slice(0, 10),
        status: r.status,
      })),
    };
  }

  async deleteSubmission(orgId: string, submissionId: string) {
    const submission = await this.prisma.submission.findFirst({
      where: { id: submissionId, organizationId: orgId, deletedAt: null },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    await this.prisma.submission.update({
      where: { id: submissionId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Submission deleted successfully' };
  }

  private async assertProject(orgId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: orgId, deletedAt: null },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }
  }
}

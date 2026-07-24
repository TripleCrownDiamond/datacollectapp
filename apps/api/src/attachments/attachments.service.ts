import { Injectable, NotFoundException, ConflictException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '@prisma/client';

@Injectable()
export class AttachmentsService {
  constructor(private prisma: PrismaService) {}

  async declare(
    orgId: string,
    data: {
      uuid: string;
      submissionId: string;
      questionName: string;
      fileName: string;
      mimeType: string;
      sizeBytes: number;
      checksumSha256?: string;
    },
  ) {
    const existing = await this.prisma.attachment.findUnique({
      where: { id: data.uuid },
    });

    if (existing) {
      return existing;
    }

    const submission = await this.prisma.submission.findFirst({
      where: { id: data.submissionId, organizationId: orgId, deletedAt: null },
      select: { id: true },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const storageKey = `${orgId}/submissions/${data.submissionId}/${data.uuid}`;

    return this.prisma.attachment.create({
      data: {
        id: data.uuid,
        organizationId: orgId,
        submissionId: data.submissionId,
        questionName: data.questionName,
        fileName: data.fileName,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        storageKey,
        checksumSha256: data.checksumSha256 ?? null,
        status: 'declared',
        receivedBytes: 0,
      },
    });
  }

  async getStatus(attachmentId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
      select: { status: true, receivedBytes: true, sizeBytes: true },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return attachment;
  }

  async uploadChunk(
    attachmentId: string,
    chunkIndex: number,
    _body: Buffer,
    orgId: string,
  ) {
    const attachment = await this.prisma.attachment.findFirst({
      where: { id: attachmentId, organizationId: orgId },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    if (attachment.status === 'stored') {
      throw new ConflictException('Attachment already completed');
    }

    const chunkSize = 5 * 1024 * 1024; // 5 MB
    const receivedBytes = (chunkIndex + 1) * chunkSize;
    const newReceived = Math.min(receivedBytes, Number(attachment.sizeBytes));

    return this.prisma.attachment.update({
      where: { id: attachmentId },
      data: {
        status: 'uploading',
        receivedBytes: newReceived,
      },
      select: { status: true, receivedBytes: true, sizeBytes: true },
    });
  }

  async complete(attachmentId: string, orgId: string) {
    const attachment = await this.prisma.attachment.findFirst({
      where: { id: attachmentId, organizationId: orgId },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    if (attachment.status === 'stored') {
      return { status: 'stored', message: 'Already completed' };
    }

    if (Number(attachment.receivedBytes) < Number(attachment.sizeBytes)) {
      throw new UnprocessableEntityException({
        message: 'Attachment incomplete',
        details: [
          {
            path: 'receivedBytes',
            rule: 'incomplete',
            message: `Received ${attachment.receivedBytes} of ${attachment.sizeBytes} bytes`,
          },
        ],
      });
    }

    return this.prisma.attachment.update({
      where: { id: attachmentId },
      data: { status: 'stored' },
      select: { status: true, storageKey: true },
    });
  }

  async getDownloadInfo(attachmentId: string, orgId: string) {
    const attachment = await this.prisma.attachment.findFirst({
      where: { id: attachmentId, organizationId: orgId },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    if (attachment.status !== 'stored') {
      throw new UnprocessableEntityException({
        message: 'Attachment not yet stored',
        details: [{ path: 'status', rule: 'not_ready', message: 'Upload is not complete' }],
      });
    }

    return {
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      storageKey: attachment.storageKey,
    };
  }
}

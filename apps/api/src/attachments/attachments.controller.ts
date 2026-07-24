import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AttachmentsService } from './attachments.service.js';
import { OrgScopeGuard } from '../auth/org-scope.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@Controller('attachments')
@UseGuards(AuthGuard('jwt'), OrgScopeGuard)
export class AttachmentsController {
  constructor(private attachmentsService: AttachmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async declare(
    @CurrentUser() user: { orgId: string },
    @Body()
    dto: {
      uuid: string;
      submissionId: string;
      questionName: string;
      fileName: string;
      mimeType: string;
      sizeBytes: number;
      checksumSha256?: string;
    },
  ) {
    return this.attachmentsService.declare(user.orgId, dto);
  }

  @Get(':uuid/status')
  async getStatus(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.attachmentsService.getStatus(uuid);
  }

  @Put(':uuid/chunks/:n')
  @HttpCode(HttpStatus.OK)
  async uploadChunk(
    @CurrentUser() user: { orgId: string },
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Param('n', ParseIntPipe) n: number,
    @Body() _body: unknown,
  ) {
    return this.attachmentsService.uploadChunk(uuid, n, Buffer.alloc(0), user.orgId);
  }

  @Post(':uuid/complete')
  @HttpCode(HttpStatus.OK)
  async complete(
    @CurrentUser() user: { orgId: string },
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ) {
    return this.attachmentsService.complete(uuid, user.orgId);
  }

  @Get(':uuid/download')
  async download(
    @CurrentUser() user: { orgId: string },
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ) {
    return this.attachmentsService.getDownloadInfo(uuid, user.orgId);
  }
}

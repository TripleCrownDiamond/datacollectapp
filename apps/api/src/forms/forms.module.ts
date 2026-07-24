import { Module } from '@nestjs/common';
import { FormsController, ProjectFormsController } from './forms.controller.js';
import { FormsService } from './forms.service.js';

@Module({
  controllers: [ProjectFormsController, FormsController],
  providers: [FormsService],
  exports: [FormsService],
})
export class FormsModule {}

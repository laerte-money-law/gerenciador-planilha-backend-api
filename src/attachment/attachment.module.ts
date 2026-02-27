import { Module } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { AttachmentsController } from './attachment.controller';
import { Attachment } from './model/attachment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityModule } from 'src/security/security.module';
import { SpreadsheetMetadata } from 'src/spreadsheet/model/spreadsheet.metadata.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attachment, SpreadsheetMetadata]),
    SecurityModule,
  ],
  controllers: [AttachmentsController],
  providers: [AttachmentService],
  exports: [AttachmentService],
})
export class AttachmentModule {}
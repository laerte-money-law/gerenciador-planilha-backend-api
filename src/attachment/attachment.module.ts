import { Module } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { AttachmentsController } from './attachment.controller';
import { Attachment } from './model/attachment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityModule } from 'src/security/security.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([Attachment]), SecurityModule
  ],
  controllers: [AttachmentsController],
  providers: [AttachmentService],
  exports: [AttachmentService]
})
export class AttachmentModule {}

import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AttachmentService } from './attachment.service';

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly service: AttachmentService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('spreadsheetMetadataId') spreadsheetMetadataId: string,
    @Body('rowId') rowId: number,
    @Body('description') description?: string,
  ) {
    return this.service.upload(
      file,
      spreadsheetMetadataId,
      Number(rowId),
      description,
    );
  }

  @Get()
  async list(
    @Query('spreadsheetMetadataId') spreadsheetMetadataId: string,
    @Query('rowId') rowId: number,
  ) {
    return this.service.listByRow(
      spreadsheetMetadataId,
      Number(rowId),
    );
  }

  @Get(':id')
  async getAttachment(
    @Param('id') id: string,
    @Res() res: any,
  ) {
    const attachment = await this.service.findById(id);

    const isInline =
      attachment.contentType.startsWith('image/') ||
      attachment.contentType === 'application/pdf';

    const encodedFileName = encodeURIComponent(attachment.originalName);

    res.setHeader('Content-Type', attachment.contentType);

    res.setHeader(
      'Content-Disposition',
      `${isInline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodedFileName}`
    );

    res.send(attachment.data);
  }
}

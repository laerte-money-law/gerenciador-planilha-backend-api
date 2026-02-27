import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './model/attachment.entity';
import { ConfigService } from '@nestjs/config';
import { SpreadsheetMetadata } from 'src/spreadsheet/model/spreadsheet.metadata.entity';

@Injectable()
export class AttachmentService {
  private readonly MAX_SIZE = 10 * 1024 * 1024; // 10MB

  private readonly allowedTypes = [
    'application/pdf',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  constructor(
    @InjectRepository(Attachment)
    private readonly repository: Repository<Attachment>,
    private readonly configService: ConfigService,
    @InjectRepository(SpreadsheetMetadata)
    private readonly metadataRepository: Repository<SpreadsheetMetadata>

  ) {}

  async upload(
    file: Express.Multer.File,
    spreadsheetMetadataId: string,
    rowId: number,
    description?: string,
  ) {
    this.validateFile(file);

    const attachment = this.repository.create({
      originalName: file.originalname,
      description,
      contentType: file.mimetype,
      size: file.size,
      data: file.buffer,
      spreadsheetMetadataId,
      rowId,
    });

    const saved = await this.repository.save(attachment);

    return { id: saved.id };
  }

  async listByRow(spreadsheetMetadataId: string, rowId: number) {
    const attachments = await this.repository.find({
      where: { spreadsheetMetadataId, rowId },
      select: ['id', 'originalName', 'description', 'createdAt'],
    });

    const baseUrl = this.configService.get<string>('BACKEND_HOST');

    return attachments.map((a) => ({
      id: a.id,
      name: a.originalName,
      description: a.description,
      url: `${baseUrl}/api/attachments/${a.id}`,
      createdAt: a.createdAt,
    }));
  }

  async findById(id: string) {
    const attachment = await this.repository.findOne({
      where: { id },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return attachment;
  }
  async delete(id: string, role: string, teamId: number, spreadsheetMetadataId: string) {

    const metadata = await this.metadataRepository.findOne({
      where:
        role === 'ADMIN'
          ? { id: spreadsheetMetadataId }
          : { id: spreadsheetMetadataId, team: { id: teamId } },
    });

    if (!metadata) {
      throw new NotFoundException('Planilha não encontrada');
    }

    const attachment = await this.repository.findOne({
      where: { id, spreadsheetMetadataId },
    });

    if (!attachment) {
      throw new NotFoundException('Anexo não encontrado');
    }

    await this.repository.remove(attachment);

    return { message: 'Attachment deleted!' };
  }

  private validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File not provided');
    }

    if (file.size > this.MAX_SIZE) {
      throw new BadRequestException('File exceeds 10MB');
    }

    const isImage = file.mimetype.startsWith('image/');

    if (!isImage && !this.allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }
  }

}

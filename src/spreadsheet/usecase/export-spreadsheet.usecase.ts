import { DataSource, Repository } from "typeorm";
import { SpreadsheetMetadata } from "../model/spreadsheet.metadata.entity";
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import * as XLSX from 'xlsx';
import { Attachment } from "src/attachment/model/attachment.entity";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class ExportSpreadsheetUsecase {
  constructor(
    @InjectRepository(SpreadsheetMetadata)
    private readonly metadataRepository: Repository<SpreadsheetMetadata>,

    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,

    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    spreadsheetId: string,
    role: string,
    teamId: number,
  ) {
    const metadata = await this.findMetadata(spreadsheetId, role, teamId);

    const rows = await this.fetchRows(metadata.tableName);

    if (rows.length === 0) {
      throw new BadRequestException(
        'Esta planilha não possui dados para exportação',
      );
    }

    const attachmentsMap = await this.buildAttachmentsMap(spreadsheetId);

    const { header, data } = this.buildExportData(rows, attachmentsMap);

    return this.generateXlsx(metadata.tableName, header, data);
  }

  private async findMetadata(
    spreadsheetId: string,
    role: string,
    teamId: number,
  ) {
    const metadata = await this.metadataRepository.findOne({
      where:
        role === 'ADMIN'
          ? { id: spreadsheetId }
          : { id: spreadsheetId, team: { id: teamId } },
    });

    if (!metadata) {
      throw new NotFoundException('Planilha não encontrada');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(metadata.tableName)) {
      throw new Error('Nome de tabela inválido');
    }

    return metadata;
  }

  private async fetchRows(tableName: string) {
    return this.dataSource
      .createQueryBuilder()
      .select('t.*')
      .from(tableName, 't')
      .orderBy('t.id_ml', 'ASC')
      .getRawMany();
  }

  private async buildAttachmentsMap(spreadsheetId: string) {
    const attachments = await this.attachmentRepository.find({
      where: { spreadsheetMetadataId: spreadsheetId },
      select: ['id', 'rowId'],
    });

    const baseUrl = this.configService.get<string>('BACKEND_HOST');
    if (!baseUrl) {
      throw new Error('BACKEND_HOST não configurado');
    }

    const map = new Map<number, string[]>();

    for (const att of attachments) {
      const url = `${baseUrl}/api/attachments/${att.id}`;

      if (!map.has(att.rowId)) {
        map.set(att.rowId, []);
      }

      map.get(att.rowId)!.push(url);
    }

    return map;
  }

  private buildExportData(
    rows: any[],
    attachmentsMap: Map<number, string[]>,
  ) {
    const technicalColumns = [
      'created_by',
      'last_updated_by',
      'team_id',
      'created_at',
    ];

    const header = Object.keys(rows[0]).filter(
      (col) => !technicalColumns.includes(col),
    );

    const finalHeader = [...header, 'ANEXOS'];

    const data = rows.map((row) => {
      const urls = attachmentsMap.get(row.id) ?? [];

      const newRow: any = {};

      finalHeader.forEach((key) => {
        newRow[key] =
          key === 'ANEXOS' ? urls.join(', ') : row[key];
      });

      return newRow;
    });

    return { header: finalHeader, data };
  }

  private generateXlsx(
    tableName: string,
    header: string[],
    data: any[],
  ) {
    const worksheet = XLSX.utils.json_to_sheet(data, { header });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Planilha');

    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    const date = new Date().toISOString().split('T')[0];

    return {
      buffer,
      fileName: `${tableName}_export_${date}.xlsx`,
    };
  }
}
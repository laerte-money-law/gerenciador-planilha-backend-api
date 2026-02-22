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
        
    ){}


   async execute(
    spreadsheetId: string,
    role: string,
    teamId: number) {
        const metadata = await this.metadataRepository.findOne({
            where:
                role === 'ADMIN'
                ? { id: spreadsheetId }
                : { id: spreadsheetId, team: { id: teamId } },
        });

        if (!metadata) {
            throw new NotFoundException('Planilha não encontrada');
        }
        
        const attachments = await this.attachmentRepository.find({
            where: { spreadsheetMetadataId: spreadsheetId },
            select: ['id', 'rowId'],
        });

        const baseUrl = this.configService.get<string>('BACKEND_HOST');

        const attachmentsMap = new Map<number, string[]>();

        for (const att of attachments) {
            const url = `${baseUrl}/api/attachments/${att.id}`;

            if (!attachmentsMap.has(att.rowId)) {
                attachmentsMap.set(att.rowId, []);
            }

            attachmentsMap.get(att.rowId)!.push(url);
        }

        const tableName = metadata.tableName;
        if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
            throw new Error('Nome de tabela inválido');
        }
        
        const rows = await this.dataSource
            .createQueryBuilder()
            .select('t.*')
            .from(tableName, 't')
            .orderBy('t.id', 'ASC')
            .getRawMany();

            let header: string[] = [];
            let filteredRows: any[] = [];

        if (rows.length > 0) {
            const technicalColumns = [
                'created_by',
                'last_updated_by',
                'team_id',
                'created_at',
            ];

            header = Object.keys(rows[0]).filter(
                (col) => !technicalColumns.includes(col),
            );

            header = [...header, 'ANEXOS'];

            filteredRows = rows.map((row) => {
                const urls = attachmentsMap.get(row.id) ?? [];

                const newRow: any = {};

                header.forEach((key) => {
                if (key === 'ANEXOS') {
                    newRow[key] = urls.join(', ');
                } else {
                    newRow[key] = row[key];
                }
                });

                return newRow;
            });
        } else{
            throw new BadRequestException('Esta planilha não possui dados para exportação');
        }
        
        const worksheet = XLSX.utils.json_to_sheet(filteredRows, {
            header,
        });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Planilha');

        const buffer = XLSX.write(workbook, {
            type: 'buffer',
            bookType: 'xlsx',
        });

        const baseName = tableName.replace(/\.[^/.]+$/, '');
        const date = new Date().toISOString().split('T')[0];

        return {
            buffer,
            fileName: `${baseName}_export_${date}.xlsx`,
        };
    }
}
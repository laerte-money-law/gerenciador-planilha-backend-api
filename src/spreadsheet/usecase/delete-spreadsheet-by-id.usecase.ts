import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SpreadsheetMetadata } from '../model/spreadsheet.metadata.entity';

@Injectable()
export class DeleteSpreadsheetByIdUsecase {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(SpreadsheetMetadata)
    private readonly metadataRepository: Repository<SpreadsheetMetadata>,
  ) {}

  async execute(
    spreadsheetId: string,
    role: string,
    teamId: number,
  ): Promise<{ message: string; deletedId: string }> {
    // Verificar se a planilha existe e se o usuário tem permissão

    const metadata = await this.metadataRepository.findOne({
      where:
        role === 'ADMIN'
          ? { id: spreadsheetId }
          : { id: spreadsheetId, team: { id: teamId } },
    });

    if (!metadata) {
      throw new Error('Planilha não encontrada ou sem permissão para deletar');
    }

    const tableName = metadata.tableName;
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      // Deletar a tabela dinâmica
      console.log(`[deleteSpreadsheet] dropping table ${tableName}`);
      await queryRunner.query(`DROP TABLE [${tableName}];`);

      // Deletar o registro de metadados
      console.log(`[deleteSpreadsheet] deleting metadata ${spreadsheetId}`);
      await this.metadataRepository.delete(spreadsheetId);

      console.log(
        `[deleteSpreadsheet] completed: deleted spreadsheet ${spreadsheetId}`,
      );

      return {
        message: 'Planilha deletada com sucesso',
        deletedId: spreadsheetId,
      };
    } catch (error) {
      console.error(
        `[deleteSpreadsheet] erro ao deletar planilha ${spreadsheetId}:`,
        error,
      );
      throw error;
    }
  }
}

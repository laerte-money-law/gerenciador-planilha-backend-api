import { Module } from '@nestjs/common';
import { DynamicTableRepository } from './repository/dynamic-table.repository';
import { SqlBuilderService } from './service/sql-builder.service';

@Module({
  providers: [
    DynamicTableRepository,
    SqlBuilderService
  ],
  exports: [
    DynamicTableRepository
  ]
})
export class InfraModule {}

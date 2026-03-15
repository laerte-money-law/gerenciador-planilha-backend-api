import { Module } from '@nestjs/common';
import { DynamicTableRepository } from './repository/dynamic-table.repository';
import { SqlBuilderService } from './service/sql-builder.service';
import { DatabaseInitializerService } from './service/database-initializer.service';

@Module({
  providers: [
    DynamicTableRepository,
    SqlBuilderService,
    DatabaseInitializerService
  ],
  exports: [
    DynamicTableRepository
  ]
})
export class InfraModule {}

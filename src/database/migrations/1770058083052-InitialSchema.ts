import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1770058083052 implements MigrationInterface {
    name = 'InitialSchema1770058083052'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "spreadsheet_metadata" ADD "service" nvarchar(100)`);
        await queryRunner.query(`ALTER TABLE "spreadsheet_metadata" ADD "status" nvarchar(50)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "spreadsheet_metadata" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "spreadsheet_metadata" DROP COLUMN "service"`);
    }

}

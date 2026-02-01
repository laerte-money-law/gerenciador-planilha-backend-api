import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1769954481380 implements MigrationInterface {
    name = 'InitialSchema1769954481380'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "spreadsheet_metadata" DROP COLUMN "team_id"`);
        await queryRunner.query(`ALTER TABLE "spreadsheet_metadata" ADD "team_id" int NOT NULL`);
        await queryRunner.query(`ALTER TABLE "spreadsheet_metadata" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "spreadsheet_metadata" ADD "created_by" int NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "spreadsheet_metadata" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "spreadsheet_metadata" ADD "created_by" uniqueidentifier NOT NULL`);
        await queryRunner.query(`ALTER TABLE "spreadsheet_metadata" DROP COLUMN "team_id"`);
        await queryRunner.query(`ALTER TABLE "spreadsheet_metadata" ADD "team_id" uniqueidentifier NOT NULL`);
    }

}

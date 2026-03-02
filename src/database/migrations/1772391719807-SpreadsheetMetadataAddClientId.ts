import { MigrationInterface, QueryRunner } from "typeorm";

export class SpreadsheetMetadataAddClientId1772391719807 implements MigrationInterface {
    name = 'SpreadsheetMetadataAddClientId1772391719807'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "spreadsheet_metadata" ADD "client_id" int`);
        await queryRunner.query(`ALTER TABLE "spreadsheet_metadata" ADD CONSTRAINT "FK_33b8f2dcff0d5a9991031b596e7" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "spreadsheet_metadata" DROP CONSTRAINT "FK_33b8f2dcff0d5a9991031b596e7"`);
        await queryRunner.query(`ALTER TABLE "spreadsheet_metadata" DROP COLUMN "client_id"`);
    }

}

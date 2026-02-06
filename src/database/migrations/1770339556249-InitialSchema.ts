import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1770339556249 implements MigrationInterface {
    name = 'InitialSchema1770339556249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "spreadsheet_metadata" ALTER COLUMN "team_id" int`);
        await queryRunner.query(`ALTER TABLE "spreadsheet_metadata" ADD CONSTRAINT "FK_3d1c23c17e1a10de8406bd9a3c5" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "spreadsheet_metadata" DROP CONSTRAINT "FK_3d1c23c17e1a10de8406bd9a3c5"`);
        await queryRunner.query(`ALTER TABLE "spreadsheet_metadata" ALTER COLUMN "team_id" int NOT NULL`);
    }

}

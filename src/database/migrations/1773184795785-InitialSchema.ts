import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1773184795785 implements MigrationInterface {
    name = 'InitialSchema1773184795785'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attachments" ADD "fileType" nvarchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attachments" DROP COLUMN "fileType"`);
    }

}

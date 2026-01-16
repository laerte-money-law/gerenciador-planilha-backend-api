import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTeamNameUnique1768582820319 implements MigrationInterface {
    name = 'UpdateTeamNameUnique1768582820319'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "UQ_cf461f5b40cf1a2b8876011e1e1" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "team_id" int`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_155dbc144ff2bd4713fdf1f6c77" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_155dbc144ff2bd4713fdf1f6c77"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "team_id" int NOT NULL`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "UQ_cf461f5b40cf1a2b8876011e1e1"`);
    }

}

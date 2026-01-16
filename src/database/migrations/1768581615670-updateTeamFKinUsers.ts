import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTeamFKinUsers1768581615670 implements MigrationInterface {
    name = 'UpdateTeamFKinUsers1768581615670'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "team_id" int`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_155dbc144ff2bd4713fdf1f6c77" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_155dbc144ff2bd4713fdf1f6c77"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "team_id" int NOT NULL`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1769882311973 implements MigrationInterface {
    name = 'InitialSchema1769882311973'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "team" ("id" int NOT NULL IDENTITY(1,1), "name" nvarchar(255) NOT NULL, CONSTRAINT "UQ_cf461f5b40cf1a2b8876011e1e1" UNIQUE ("name"), CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" int NOT NULL IDENTITY(1,1), "name" nvarchar(255) NOT NULL, "email" nvarchar(255) NOT NULL, "password_hash" nvarchar(255) NOT NULL, "created_at" datetime2 NOT NULL CONSTRAINT "DF_d091f1d36f18bbece2a9eabc6e0" DEFAULT getdate(), "role" nvarchar(255) CONSTRAINT "DF_6620cd026ee2b231beac7cfe578" DEFAULT 'USER', "team_id" int, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "spreadsheet_metadata" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_3b31b4366e9e579072b4d2f3f30" DEFAULT NEWSEQUENTIALID(), "table_name" nvarchar(255) NOT NULL, "original_filename" nvarchar(255) NOT NULL, "team_id" uniqueidentifier NOT NULL, "created_by" uniqueidentifier NOT NULL, "created_at" datetime2 NOT NULL CONSTRAINT "DF_55797af5a88788d9fbfaf24324f" DEFAULT SYSDATETIME(), CONSTRAINT "PK_3b31b4366e9e579072b4d2f3f30" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_155dbc144ff2bd4713fdf1f6c77" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_155dbc144ff2bd4713fdf1f6c77"`);
        await queryRunner.query(`DROP TABLE "spreadsheet_metadata"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "team"`);
    }

}

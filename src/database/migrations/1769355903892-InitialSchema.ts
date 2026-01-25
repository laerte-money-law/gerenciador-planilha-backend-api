import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1769355903892 implements MigrationInterface {
    name = 'InitialSchema1769355903892'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "team" ("id" int NOT NULL IDENTITY(1,1), "name" nvarchar(255) NOT NULL, CONSTRAINT "UQ_cf461f5b40cf1a2b8876011e1e1" UNIQUE ("name"), CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" int NOT NULL IDENTITY(1,1), "name" nvarchar(255) NOT NULL, "email" nvarchar(255) NOT NULL, "password_hash" nvarchar(255) NOT NULL, "created_at" datetime2 NOT NULL CONSTRAINT "DF_d091f1d36f18bbece2a9eabc6e0" DEFAULT getdate(), "role" nvarchar(255) CONSTRAINT "DF_6620cd026ee2b231beac7cfe578" DEFAULT 'USER', "team_id" int, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "spreadsheet" ("id" int NOT NULL IDENTITY(1,1), "name" nvarchar(255) NOT NULL, "team_id" int NOT NULL, "created_by" int NOT NULL, "created_at" datetime2 NOT NULL CONSTRAINT "DF_a0bfb719fbd637ed40f71fba5cb" DEFAULT getdate(), CONSTRAINT "PK_cf23a0f2f0d0c63dabc0e65e020" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "row" ("id" int NOT NULL IDENTITY(1,1), "spreadsheet_id" int NOT NULL, "status" nvarchar(255) NOT NULL, "order_index" int NOT NULL, CONSTRAINT "PK_8a1504a78acbc2e1273f69f03aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "column" ("id" int NOT NULL IDENTITY(1,1), "title" nvarchar(255) NOT NULL, "spreadsheet_id" int NOT NULL, "order_index" int NOT NULL, "created_at" datetime2 NOT NULL CONSTRAINT "DF_869094551ea04ef14f0ce286e37" DEFAULT getdate(), CONSTRAINT "PK_cee3c7ee3135537fb8f5df4422b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cell" ("id" int NOT NULL IDENTITY(1,1), "row_id" int NOT NULL, "column_id" int NOT NULL, "value" text, "last_edited_by" int NOT NULL, "created_at" datetime2 NOT NULL CONSTRAINT "DF_06933a8e3a11122c693c9ae1395" DEFAULT getdate(), "updated_at" datetime2 NOT NULL CONSTRAINT "DF_54bab518ee9e4522c331cbdbc06" DEFAULT getdate(), CONSTRAINT "UQ_de16589fb5dece60f80e2c1a656" UNIQUE ("row_id", "column_id"), CONSTRAINT "PK_6f34717c251843e5ca32fc1b2b8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_155dbc144ff2bd4713fdf1f6c77" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_155dbc144ff2bd4713fdf1f6c77"`);
        await queryRunner.query(`DROP TABLE "cell"`);
        await queryRunner.query(`DROP TABLE "column"`);
        await queryRunner.query(`DROP TABLE "row"`);
        await queryRunner.query(`DROP TABLE "spreadsheet"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "team"`);
    }

}

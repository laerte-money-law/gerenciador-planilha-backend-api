import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1771113645734 implements MigrationInterface {
    name = 'InitialSchema1771113645734'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "attachments" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_5e1f050bcff31e3084a1d662412" DEFAULT NEWSEQUENTIALID(), "originalName" nvarchar(255) NOT NULL, "description" nvarchar(255), "contentType" nvarchar(255) NOT NULL, "size" bigint NOT NULL, "data" varbinary(max) NOT NULL, "spreadsheetMetadataId" uniqueidentifier NOT NULL, "rowId" int NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_8df7f2e80f016ffd718f52a0849" DEFAULT getdate(), CONSTRAINT "PK_5e1f050bcff31e3084a1d662412" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8a601d71516160f11ffe22c61f" ON "attachments" ("spreadsheetMetadataId", "rowId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_8a601d71516160f11ffe22c61f" ON "attachments"`);
        await queryRunner.query(`DROP TABLE "attachments"`);
    }

}

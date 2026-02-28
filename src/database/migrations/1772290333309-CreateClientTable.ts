import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateClientTable1772290333309 implements MigrationInterface {
    name = 'CreateClientTable1772290333309'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "client" ("id" int NOT NULL IDENTITY(1,1), "cnpj" nvarchar(255) NOT NULL, "nomeEmpresa" nvarchar(255) NOT NULL, "endereco" nvarchar(255), "bairro" nvarchar(255), "cidade" nvarchar(255), "uf" nvarchar(255), "cep" nvarchar(255), "nomeContato" nvarchar(255), "foneContato" nvarchar(255), "emailContato" nvarchar(255), CONSTRAINT "UQ_ebf1bb18c08139bbdf229244d80" UNIQUE ("cnpj"), CONSTRAINT "PK_96da49381769303a6515a8785c7" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "client"`);
    }

}

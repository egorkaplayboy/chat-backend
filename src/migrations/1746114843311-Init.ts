import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1746114843311 implements MigrationInterface {
  name = 'Init1746114843311';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "storage_item" ("id" uuid NOT NULL, "originalname" text NOT NULL, "mimetype" text NOT NULL, "size" bigint NOT NULL, "filename" text, "path" text NOT NULL, "thumbnail_path" text, CONSTRAINT "PK_5b6ea629e0b86cbbced734b74a3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5b6ea629e0b86cbbced734b74a" ON "storage_item" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL, "username" text NOT NULL, "password" text NOT NULL, "first_name" text NOT NULL, "last_name" text NOT NULL, "created_at" bigint NOT NULL, "avatar_id" uuid, CONSTRAINT "REL_c3401836efedec3bec459c8f81" UNIQUE ("avatar_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users" ("username") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_c3401836efedec3bec459c8f818" FOREIGN KEY ("avatar_id") REFERENCES "storage_item"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_c3401836efedec3bec459c8f818"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fe0bb3f6520ee0469504521e71"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5b6ea629e0b86cbbced734b74a"`,
    );
    await queryRunner.query(`DROP TABLE "storage_item"`);
  }
}

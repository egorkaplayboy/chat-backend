import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1746172364979 implements MigrationInterface {
    name = 'Init1746172364979'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "storage_item" ("id" uuid NOT NULL, "originalname" text NOT NULL, "mimetype" text NOT NULL, "size" bigint NOT NULL, "filename" text, "path" text NOT NULL, "thumbnail_path" text, CONSTRAINT "PK_5b6ea629e0b86cbbced734b74a3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5b6ea629e0b86cbbced734b74a" ON "storage_item" ("id") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL, "username" text NOT NULL, "password" text NOT NULL, "first_name" text NOT NULL, "last_name" text NOT NULL, "created_at" bigint NOT NULL, "avatar_id" uuid, "online" bigint, CONSTRAINT "REL_c3401836efedec3bec459c8f81" UNIQUE ("avatar_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users" ("username") `);
        await queryRunner.query(`CREATE TABLE "chat" ("id" uuid NOT NULL, "type" character varying NOT NULL, "created_at" bigint NOT NULL, "name" text, CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9d0b2ba74336710fd31154738a" ON "chat" ("id") `);
        await queryRunner.query(`CREATE TABLE "message" ("id" uuid NOT NULL, "text" text, "author_id" uuid NOT NULL, "chat_id" uuid NOT NULL, "reply_id" uuid, "sort_order" bigint NOT NULL, "created_at" bigint NOT NULL, "updated_at" bigint NOT NULL, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_10e1e9e65883f5e04f5578078d" ON "message" ("author_id", "chat_id", "sort_order") `);
        await queryRunner.query(`CREATE TABLE "last_read_message" ("id" uuid NOT NULL, "chat_id" uuid NOT NULL, "user_id" uuid NOT NULL, "message_id" uuid NOT NULL, CONSTRAINT "PK_50556009a1d0cdb4af5905e3948" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_faca08f90c1a6f61571fffb1f1" ON "last_read_message" ("chat_id", "user_id", "message_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a4cafd8a1c09bca33a0c049343" ON "last_read_message" ("chat_id", "user_id") `);
        await queryRunner.query(`CREATE TABLE "chat_user_setting" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "chat_id" uuid NOT NULL, "notify" boolean NOT NULL DEFAULT true, "pinned" boolean NOT NULL DEFAULT false, "archived" boolean NOT NULL DEFAULT false, "blocked" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_4a4306b724d78016dbf5700e361" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat_members" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "chat_id" uuid NOT NULL, "created_at" bigint NOT NULL, CONSTRAINT "PK_aea646f59c92c47af5804ce73a7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b4a04a57c87d984b806c95eac6" ON "chat_members" ("user_id", "chat_id") `);
        await queryRunner.query(`CREATE TABLE "message_reaction" ("id" uuid NOT NULL, "message_id" uuid NOT NULL, "author_id" uuid NOT NULL, "value" text NOT NULL, CONSTRAINT "PK_20b89d1447ef973e9f10973f220" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d071bd5a52840f8ff04385f3ca" ON "message_reaction" ("message_id", "author_id", "value") `);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_c3401836efedec3bec459c8f818" FOREIGN KEY ("avatar_id") REFERENCES "storage_item"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_27675d1d5b9dbaabc0546aeb0a1" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_859ffc7f95098efb4d84d50c632" FOREIGN KEY ("chat_id") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_b7eaafb97fae68010f751d75be3" FOREIGN KEY ("reply_id") REFERENCES "message"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "last_read_message" ADD CONSTRAINT "FK_d873bf0812562529eb994e6e102" FOREIGN KEY ("chat_id") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "last_read_message" ADD CONSTRAINT "FK_e5eabafd70d63324e279a6dfd9c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "last_read_message" ADD CONSTRAINT "FK_2e346cbb5b85ef2b172c36412ab" FOREIGN KEY ("message_id") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_user_setting" ADD CONSTRAINT "FK_14e765e118f83dbefaaa8d7c3ff" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_user_setting" ADD CONSTRAINT "FK_74aa81db9627b7de0ffaa215a59" FOREIGN KEY ("chat_id") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_members" ADD CONSTRAINT "FK_9dc61e92eed1dc151c2b2ef01a0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_members" ADD CONSTRAINT "FK_29ffb4b6edf59a7862129765339" FOREIGN KEY ("chat_id") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message_reaction" ADD CONSTRAINT "FK_c3aa2868fc9b2bc57d067642c58" FOREIGN KEY ("message_id") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message_reaction" ADD CONSTRAINT "FK_c4a1fbfbab232d03f8f6eac5984" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message_reaction" DROP CONSTRAINT "FK_c4a1fbfbab232d03f8f6eac5984"`);
        await queryRunner.query(`ALTER TABLE "message_reaction" DROP CONSTRAINT "FK_c3aa2868fc9b2bc57d067642c58"`);
        await queryRunner.query(`ALTER TABLE "chat_members" DROP CONSTRAINT "FK_29ffb4b6edf59a7862129765339"`);
        await queryRunner.query(`ALTER TABLE "chat_members" DROP CONSTRAINT "FK_9dc61e92eed1dc151c2b2ef01a0"`);
        await queryRunner.query(`ALTER TABLE "chat_user_setting" DROP CONSTRAINT "FK_74aa81db9627b7de0ffaa215a59"`);
        await queryRunner.query(`ALTER TABLE "chat_user_setting" DROP CONSTRAINT "FK_14e765e118f83dbefaaa8d7c3ff"`);
        await queryRunner.query(`ALTER TABLE "last_read_message" DROP CONSTRAINT "FK_2e346cbb5b85ef2b172c36412ab"`);
        await queryRunner.query(`ALTER TABLE "last_read_message" DROP CONSTRAINT "FK_e5eabafd70d63324e279a6dfd9c"`);
        await queryRunner.query(`ALTER TABLE "last_read_message" DROP CONSTRAINT "FK_d873bf0812562529eb994e6e102"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_b7eaafb97fae68010f751d75be3"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_859ffc7f95098efb4d84d50c632"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_27675d1d5b9dbaabc0546aeb0a1"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_c3401836efedec3bec459c8f818"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d071bd5a52840f8ff04385f3ca"`);
        await queryRunner.query(`DROP TABLE "message_reaction"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b4a04a57c87d984b806c95eac6"`);
        await queryRunner.query(`DROP TABLE "chat_members"`);
        await queryRunner.query(`DROP TABLE "chat_user_setting"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a4cafd8a1c09bca33a0c049343"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_faca08f90c1a6f61571fffb1f1"`);
        await queryRunner.query(`DROP TABLE "last_read_message"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_10e1e9e65883f5e04f5578078d"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9d0b2ba74336710fd31154738a"`);
        await queryRunner.query(`DROP TABLE "chat"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fe0bb3f6520ee0469504521e71"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5b6ea629e0b86cbbced734b74a"`);
        await queryRunner.query(`DROP TABLE "storage_item"`);
    }

}

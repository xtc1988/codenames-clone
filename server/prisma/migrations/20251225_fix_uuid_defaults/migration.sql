-- マイグレーション: UUIDデフォルト値の追加
-- すべてのテーブルのidカラムにUUID自動生成を設定

-- uuid-ossp拡張を有効化（gen_random_uuid関数を使用するため）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- word_packs
ALTER TABLE "word_packs" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;
ALTER TABLE "word_packs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- words
ALTER TABLE "words" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;
ALTER TABLE "words" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "words" ALTER COLUMN "word_pack_id" SET DATA TYPE UUID USING "word_pack_id"::uuid;

-- rooms
ALTER TABLE "rooms" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;
ALTER TABLE "rooms" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "rooms" ALTER COLUMN "word_pack_id" SET DATA TYPE UUID USING "word_pack_id"::uuid;

-- players
ALTER TABLE "players" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;
ALTER TABLE "players" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "players" ALTER COLUMN "room_id" SET DATA TYPE UUID USING "room_id"::uuid;

-- cards
ALTER TABLE "cards" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;
ALTER TABLE "cards" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "cards" ALTER COLUMN "room_id" SET DATA TYPE UUID USING "room_id"::uuid;
ALTER TABLE "cards" ALTER COLUMN "revealed_by" SET DATA TYPE UUID USING "revealed_by"::uuid;

-- hints
ALTER TABLE "hints" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;
ALTER TABLE "hints" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "hints" ALTER COLUMN "room_id" SET DATA TYPE UUID USING "room_id"::uuid;
ALTER TABLE "hints" ALTER COLUMN "player_id" SET DATA TYPE UUID USING "player_id"::uuid;

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('WAITING', 'PLAYING', 'FINISHED');

-- CreateEnum
CREATE TYPE "Team" AS ENUM ('RED', 'BLUE', 'SPECTATOR');

-- CreateEnum
CREATE TYPE "PlayerRole" AS ENUM ('SPYMASTER', 'OPERATIVE');

-- CreateEnum
CREATE TYPE "SpectatorView" AS ENUM ('SPYMASTER', 'OPERATIVE');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('RED', 'BLUE', 'NEUTRAL', 'ASSASSIN');

-- CreateTable
CREATE TABLE "word_packs" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "language" VARCHAR(10) NOT NULL DEFAULT 'ja',
    "creator_session_id" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "word_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "words" (
    "id" TEXT NOT NULL,
    "word_pack_id" TEXT NOT NULL,
    "word" VARCHAR(100) NOT NULL,

    CONSTRAINT "words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" "RoomStatus" NOT NULL DEFAULT 'WAITING',
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "word_pack_id" TEXT NOT NULL,
    "current_turn" "Team",
    "winner" "Team",
    "timer_seconds" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "nickname" VARCHAR(50) NOT NULL,
    "team" "Team" NOT NULL DEFAULT 'SPECTATOR',
    "role" "PlayerRole",
    "session_id" VARCHAR(255) NOT NULL,
    "is_host" BOOLEAN NOT NULL DEFAULT false,
    "spectator_view" "SpectatorView" NOT NULL DEFAULT 'OPERATIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "word" VARCHAR(100) NOT NULL,
    "position" INTEGER NOT NULL,
    "type" "CardType" NOT NULL,
    "is_revealed" BOOLEAN NOT NULL DEFAULT false,
    "revealed_by" TEXT,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hints" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "word" VARCHAR(100) NOT NULL,
    "count" INTEGER NOT NULL,
    "team" "Team" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "words_word_pack_id_idx" ON "words"("word_pack_id");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_code_key" ON "rooms"("code");

-- CreateIndex
CREATE INDEX "rooms_code_idx" ON "rooms"("code");

-- CreateIndex
CREATE INDEX "rooms_status_idx" ON "rooms"("status");

-- CreateIndex
CREATE INDEX "players_room_id_idx" ON "players"("room_id");

-- CreateIndex
CREATE INDEX "players_session_id_idx" ON "players"("session_id");

-- CreateIndex
CREATE INDEX "cards_room_id_idx" ON "cards"("room_id");

-- CreateIndex
CREATE INDEX "hints_room_id_idx" ON "hints"("room_id");

-- AddForeignKey
ALTER TABLE "words" ADD CONSTRAINT "words_word_pack_id_fkey" FOREIGN KEY ("word_pack_id") REFERENCES "word_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_word_pack_id_fkey" FOREIGN KEY ("word_pack_id") REFERENCES "word_packs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_revealed_by_fkey" FOREIGN KEY ("revealed_by") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hints" ADD CONSTRAINT "hints_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hints" ADD CONSTRAINT "hints_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

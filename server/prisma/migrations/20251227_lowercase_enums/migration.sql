-- Migration: Change all enum values to lowercase
-- This migration updates all PostgreSQL enum types to use lowercase values

-- Step 0: Drop temporary types if they exist (from previous failed attempts)
DROP TYPE IF EXISTS "RoomStatus_new";
DROP TYPE IF EXISTS "Team_new";
DROP TYPE IF EXISTS "PlayerRole_new";
DROP TYPE IF EXISTS "SpectatorView_new";
DROP TYPE IF EXISTS "CardType_new";

-- Step 1: Create new enum types with lowercase values
CREATE TYPE "RoomStatus_new" AS ENUM ('waiting', 'playing', 'finished');
CREATE TYPE "Team_new" AS ENUM ('red', 'blue', 'spectator');
CREATE TYPE "PlayerRole_new" AS ENUM ('spymaster', 'operative');
CREATE TYPE "SpectatorView_new" AS ENUM ('spymaster', 'operative');
CREATE TYPE "CardType_new" AS ENUM ('red', 'blue', 'neutral', 'assassin');

-- Step 2: Update rooms table
ALTER TABLE "rooms" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "rooms" ALTER COLUMN "status" TYPE "RoomStatus_new" USING (
  CASE "status"::text
    WHEN 'WAITING' THEN 'waiting'
    WHEN 'PLAYING' THEN 'playing'
    WHEN 'FINISHED' THEN 'finished'
  END
)::"RoomStatus_new";
ALTER TABLE "rooms" ALTER COLUMN "status" SET DEFAULT 'waiting'::"RoomStatus_new";

ALTER TABLE "rooms" ALTER COLUMN "current_turn" TYPE "Team_new" USING (
  CASE "current_turn"::text
    WHEN 'RED' THEN 'red'
    WHEN 'BLUE' THEN 'blue'
    WHEN 'SPECTATOR' THEN 'spectator'
    ELSE NULL
  END
)::"Team_new";

ALTER TABLE "rooms" ALTER COLUMN "winner" TYPE "Team_new" USING (
  CASE "winner"::text
    WHEN 'RED' THEN 'red'
    WHEN 'BLUE' THEN 'blue'
    WHEN 'SPECTATOR' THEN 'spectator'
    ELSE NULL
  END
)::"Team_new";

-- Step 3: Update players table
ALTER TABLE "players" ALTER COLUMN "team" DROP DEFAULT;
ALTER TABLE "players" ALTER COLUMN "team" TYPE "Team_new" USING (
  CASE "team"::text
    WHEN 'RED' THEN 'red'
    WHEN 'BLUE' THEN 'blue'
    WHEN 'SPECTATOR' THEN 'spectator'
  END
)::"Team_new";
ALTER TABLE "players" ALTER COLUMN "team" SET DEFAULT 'spectator'::"Team_new";

ALTER TABLE "players" ALTER COLUMN "role" TYPE "PlayerRole_new" USING (
  CASE "role"::text
    WHEN 'SPYMASTER' THEN 'spymaster'
    WHEN 'OPERATIVE' THEN 'operative'
    ELSE NULL
  END
)::"PlayerRole_new";

ALTER TABLE "players" ALTER COLUMN "spectator_view" DROP DEFAULT;
ALTER TABLE "players" ALTER COLUMN "spectator_view" TYPE "SpectatorView_new" USING (
  CASE "spectator_view"::text
    WHEN 'SPYMASTER' THEN 'spymaster'
    WHEN 'OPERATIVE' THEN 'operative'
  END
)::"SpectatorView_new";
ALTER TABLE "players" ALTER COLUMN "spectator_view" SET DEFAULT 'operative'::"SpectatorView_new";

-- Step 4: Update cards table
ALTER TABLE "cards" ALTER COLUMN "type" TYPE "CardType_new" USING (
  CASE "type"::text
    WHEN 'RED' THEN 'red'
    WHEN 'BLUE' THEN 'blue'
    WHEN 'NEUTRAL' THEN 'neutral'
    WHEN 'ASSASSIN' THEN 'assassin'
  END
)::"CardType_new";

-- Step 5: Update hints table
ALTER TABLE "hints" ALTER COLUMN "team" TYPE "Team_new" USING (
  CASE "team"::text
    WHEN 'RED' THEN 'red'
    WHEN 'BLUE' THEN 'blue'
    WHEN 'SPECTATOR' THEN 'spectator'
  END
)::"Team_new";

-- Step 6: Drop old enum types
DROP TYPE "RoomStatus";
DROP TYPE "Team";
DROP TYPE "PlayerRole";
DROP TYPE "SpectatorView";
DROP TYPE "CardType";

-- Step 7: Rename new enum types to original names
ALTER TYPE "RoomStatus_new" RENAME TO "RoomStatus";
ALTER TYPE "Team_new" RENAME TO "Team";
ALTER TYPE "PlayerRole_new" RENAME TO "PlayerRole";
ALTER TYPE "SpectatorView_new" RENAME TO "SpectatorView";
ALTER TYPE "CardType_new" RENAME TO "CardType";

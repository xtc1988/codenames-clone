-- Add is_ai column to players table for AI Spymaster feature
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_ai BOOLEAN DEFAULT false;

-- Add index for quick AI player queries
CREATE INDEX IF NOT EXISTS idx_players_is_ai ON players(is_ai) WHERE is_ai = true;

-- Row Level Security (RLS) ポリシー設定
-- ゲストユーザー向けのシンプルなアクセス制御
-- 注: ゲストユーザー（anon key）のため、基本的に読み書き可能に設定

-- 1. word_packs: 誰でも読み書き可能（将来的に認証実装時に制限）
ALTER TABLE word_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "word_packs_all" ON word_packs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. words: 誰でも読み書き可能
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "words_all" ON words
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. rooms: 誰でも読み書き可能
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rooms_all" ON rooms
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. players: 誰でも読み書き可能
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "players_all" ON players
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. cards: 誰でも読み書き可能
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cards_all" ON cards
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. hints: 誰でも読み書き可能
ALTER TABLE hints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hints_all" ON hints
  FOR ALL
  USING (true)
  WITH CHECK (true);

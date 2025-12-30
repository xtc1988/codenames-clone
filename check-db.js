const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://djzdfefdstzlcxppkbnt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqemRmZWZkc3R6bGN4cHBrYm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1ODgwOTQsImV4cCI6MjA4MjE2NDA5NH0.6HBSnKG3rdOPrbSOhqGjayxfJ83zPMuN_1dn35bbGyw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log('=== Supabaseデータベース確認 ===\n');

  // word_packsテーブル確認
  console.log('1. word_packsテーブル:');
  const { data: wordPacks, error: wpError } = await supabase
    .from('word_packs')
    .select('*')
    .limit(5);

  if (wpError) {
    console.log('  ❌ エラー:', wpError.message);
  } else {
    console.log(`  ✅ 件数: ${wordPacks?.length || 0}`);
    if (wordPacks && wordPacks.length > 0) {
      wordPacks.forEach(pack => {
        console.log(`     - ${pack.name} (isDefault: ${pack.is_default})`);
      });
    }
  }

  // wordsテーブル確認
  console.log('\n2. wordsテーブル:');
  const { data: words, error: wError } = await supabase
    .from('words')
    .select('word_pack_id')
    .limit(10);

  if (wError) {
    console.log('  ❌ エラー:', wError.message);
  } else {
    console.log(`  ✅ 件数: ${words?.length || 0}件以上`);
  }

  // roomsテーブル確認
  console.log('\n3. roomsテーブル:');
  const { data: rooms, error: rError } = await supabase
    .from('rooms')
    .select('*')
    .limit(5);

  if (rError) {
    console.log('  ❌ エラー:', rError.message);
  } else {
    console.log(`  ✅ 件数: ${rooms?.length || 0}`);
  }

  // playersテーブル確認
  console.log('\n4. playersテーブル:');
  const { data: players, error: pError } = await supabase
    .from('players')
    .select('*')
    .limit(5);

  if (pError) {
    console.log('  ❌ エラー:', pError.message);
  } else {
    console.log(`  ✅ 件数: ${players?.length || 0}`);
  }

  // cardsテーブル確認
  console.log('\n5. cardsテーブル:');
  const { data: cards, error: cError } = await supabase
    .from('cards')
    .select('*')
    .limit(5);

  if (cError) {
    console.log('  ❌ エラー:', cError.message);
  } else {
    console.log(`  ✅ 件数: ${cards?.length || 0}`);
  }

  // hintsテーブル確認
  console.log('\n6. hintsテーブル:');
  const { data: hints, error: hError } = await supabase
    .from('hints')
    .select('*')
    .limit(5);

  if (hError) {
    console.log('  ❌ エラー:', hError.message);
  } else {
    console.log(`  ✅ 件数: ${hints?.length || 0}`);
  }

  console.log('\n=== 確認完了 ===');
}

checkDatabase().catch(console.error);

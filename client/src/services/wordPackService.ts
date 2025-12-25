import { supabase } from '@/lib/supabase';
import { getSessionId } from '@/services/roomService';

export interface WordPack {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  isDefault: boolean;
  language: string;
  creatorSessionId: string | null;
  createdAt: string;
  wordCount?: number;
}

export interface Word {
  id: string;
  wordPackId: string;
  word: string;
}

export interface WordPackDetail extends WordPack {
  words: Word[];
}

/**
 * 全単語パック取得（公開 + 自分が作成したもの）
 */
export async function getAllWordPacks(): Promise<WordPack[]> {
  try {
    const sessionId = getSessionId();

    const { data, error } = await supabase
      .from('word_packs')
      .select('*, words(count)')
      .or(`is_public.eq.true,creator_session_id.eq.${sessionId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[wordPackService] パック取得エラー:', error);
      throw new Error('単語パックの取得に失敗しました');
    }

    return (
      data?.map((pack: any) => ({
        id: pack.id,
        name: pack.name,
        description: pack.description,
        isPublic: pack.is_public,
        isDefault: pack.is_default,
        language: pack.language,
        creatorSessionId: pack.creator_session_id,
        createdAt: pack.created_at,
        wordCount: pack.words?.[0]?.count || 0,
      })) || []
    );
  } catch (error) {
    console.error('[wordPackService] エラー:', error);
    throw error;
  }
}

/**
 * 単語パック詳細取得（単語含む）
 */
export async function getWordPackById(packId: string): Promise<WordPackDetail> {
  try {
    const { data: pack, error: packError } = await supabase
      .from('word_packs')
      .select('*')
      .eq('id', packId)
      .single();

    if (packError || !pack) {
      console.error('[wordPackService] パック取得エラー:', packError);
      throw new Error('単語パックが見つかりません');
    }

    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('*')
      .eq('word_pack_id', packId)
      .order('word');

    if (wordsError) {
      console.error('[wordPackService] 単語取得エラー:', wordsError);
      throw new Error('単語の取得に失敗しました');
    }

    return {
      id: pack.id,
      name: pack.name,
      description: pack.description,
      isPublic: pack.is_public,
      isDefault: pack.is_default,
      language: pack.language,
      creatorSessionId: pack.creator_session_id,
      createdAt: pack.created_at,
      words:
        words?.map((w: any) => ({
          id: w.id,
          wordPackId: w.word_pack_id,
          word: w.word,
        })) || [],
    };
  } catch (error) {
    console.error('[wordPackService] エラー:', error);
    throw error;
  }
}

/**
 * 単語パック作成
 */
export async function createWordPack(params: {
  name: string;
  description: string;
  isPublic: boolean;
  language: string;
  words: string[];
}): Promise<WordPackDetail> {
  try {
    const sessionId = getSessionId();

    // 1. パック作成
    const { data: pack, error: packError } = await supabase
      .from('word_packs')
      .insert({
        name: params.name,
        description: params.description,
        is_public: params.isPublic,
        is_default: false,
        language: params.language,
        creator_session_id: sessionId,
      })
      .select()
      .single();

    if (packError || !pack) {
      console.error('[wordPackService] パック作成エラー:', packError);
      throw new Error('単語パックの作成に失敗しました');
    }

    // 2. 単語作成
    if (params.words.length > 0) {
      const wordsToInsert = params.words.map((word) => ({
        word_pack_id: pack.id,
        word,
      }));

      const { error: wordsError } = await supabase
        .from('words')
        .insert(wordsToInsert);

      if (wordsError) {
        console.error('[wordPackService] 単語作成エラー:', wordsError);
        throw new Error('単語の作成に失敗しました');
      }
    }

    // 3. 作成したパックを取得して返す
    return await getWordPackById(pack.id);
  } catch (error) {
    console.error('[wordPackService] エラー:', error);
    throw error;
  }
}

/**
 * 単語パック更新
 */
export async function updateWordPack(
  packId: string,
  params: {
    name?: string;
    description?: string;
    isPublic?: boolean;
  }
): Promise<WordPack> {
  try {
    const updateData: any = {};
    if (params.name !== undefined) updateData.name = params.name;
    if (params.description !== undefined) updateData.description = params.description;
    if (params.isPublic !== undefined) updateData.is_public = params.isPublic;

    const { data, error } = await supabase
      .from('word_packs')
      .update(updateData)
      .eq('id', packId)
      .select()
      .single();

    if (error || !data) {
      console.error('[wordPackService] パック更新エラー:', error);
      throw new Error('単語パックの更新に失敗しました');
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      isPublic: data.is_public,
      isDefault: data.is_default,
      language: data.language,
      creatorSessionId: data.creator_session_id,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('[wordPackService] エラー:', error);
    throw error;
  }
}

/**
 * 単語追加
 */
export async function addWords(packId: string, words: string[]): Promise<Word[]> {
  try {
    if (words.length === 0) return [];

    const wordsToInsert = words.map((word) => ({
      word_pack_id: packId,
      word,
    }));

    const { data, error } = await supabase
      .from('words')
      .insert(wordsToInsert)
      .select();

    if (error || !data) {
      console.error('[wordPackService] 単語追加エラー:', error);
      throw new Error('単語の追加に失敗しました');
    }

    return data.map((w: any) => ({
      id: w.id,
      wordPackId: w.word_pack_id,
      word: w.word,
    }));
  } catch (error) {
    console.error('[wordPackService] エラー:', error);
    throw error;
  }
}

/**
 * 単語削除
 */
export async function deleteWord(wordId: string): Promise<void> {
  try {
    const { error } = await supabase.from('words').delete().eq('id', wordId);

    if (error) {
      console.error('[wordPackService] 単語削除エラー:', error);
      throw new Error('単語の削除に失敗しました');
    }
  } catch (error) {
    console.error('[wordPackService] エラー:', error);
    throw error;
  }
}

/**
 * 単語パック削除
 */
export async function deleteWordPack(packId: string): Promise<void> {
  try {
    // カスケード削除が設定されているため、パックを削除すれば単語も自動削除される
    const { error } = await supabase.from('word_packs').delete().eq('id', packId);

    if (error) {
      console.error('[wordPackService] パック削除エラー:', error);
      throw new Error('単語パックの削除に失敗しました');
    }
  } catch (error) {
    console.error('[wordPackService] エラー:', error);
    throw error;
  }
}

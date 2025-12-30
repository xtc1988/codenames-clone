import { supabase } from '@/lib/supabase';
import { Card, Hint, Team, RoomStatus, CardType } from '@/types';
import { generateCardLayout, selectRandomWords, checkWinner } from '@/utils/gameLogic';
import { v4 as uuidv4 } from 'uuid';

/**
 * ゲームを開始
 */
export async function startGame(roomId: string, wordPackId: string): Promise<Card[]> {
  try {
    // 1. 単語パックから単語を取得
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('word')
      .eq('word_pack_id', wordPackId)
      .limit(1000);

    if (wordsError || !words || words.length < 25) {
      throw new Error('十分な単語が見つかりませんでした');
    }

    // 2. ランダムに25個選択
    const selectedWords = selectRandomWords(
      words.map((w) => w.word),
      25
    );

    // 3. カード配置生成
    const cardTypes = generateCardLayout();

    // 4. カード作成
    const cardsToInsert = selectedWords.map((word, index) => ({
      id: uuidv4(),
      room_id: roomId,
      word,
      position: index,
      type: cardTypes[index],
      is_revealed: false,
      revealed_by: null,
    }));

    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .insert(cardsToInsert)
      .select();

    if (cardsError || !cards) {
      console.error('[gameService] カード作成エラー:', cardsError);
      throw new Error('カードの作成に失敗しました');
    }

    // 5. ルームステータスを更新
    const { error: roomError } = await supabase
      .from('rooms')
      .update({
        status: RoomStatus.PLAYING,
        current_turn: Team.RED, // 赤チームから開始
      })
      .eq('id', roomId);

    if (roomError) {
      console.error('[gameService] ルーム更新エラー:', roomError);
      throw new Error('ルームステータスの更新に失敗しました');
    }

    return cards.map((c: any) => ({
      id: c.id,
      roomId: c.room_id,
      word: c.word,
      position: c.position,
      type: c.type as CardType,
      isRevealed: c.is_revealed,
      revealedBy: c.revealed_by,
    }));
  } catch (error) {
    console.error('[gameService] ゲーム開始エラー:', error);
    throw error;
  }
}

/**
 * ヒントを投稿
 */
export async function giveHint(params: {
  roomId: string;
  playerId: string;
  word: string;
  count: number;
  team: Team;
}): Promise<Hint> {
  const { roomId, playerId, word, count, team } = params;

  try {
    const { data, error } = await supabase
      .from('hints')
      .insert({
        id: uuidv4(),
        room_id: roomId,
        player_id: playerId,
        word,
        count,
        team,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('[gameService] ヒント投稿エラー:', error);
      throw new Error('ヒントの投稿に失敗しました');
    }

    return {
      id: data.id,
      roomId: data.room_id,
      playerId: data.player_id,
      word: data.word,
      count: data.count,
      team: data.team as Team,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('[gameService] エラー:', error);
    throw error;
  }
}

/**
 * カードを選択（公開）
 */
export async function revealCard(params: {
  cardId: string;
  playerId: string;
  roomId: string;
}): Promise<{
  card: Card;
  nextTurn: Team | null;
  winner: Team | null;
}> {
  const { cardId, playerId, roomId } = params;

  try {
    // 1. カードを公開
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .update({
        is_revealed: true,
        revealed_by: playerId,
      })
      .eq('id', cardId)
      .select()
      .single();

    if (cardError || !card) {
      console.error('[gameService] カード公開エラー:', cardError);
      throw new Error('カードの公開に失敗しました');
    }

    // 2. 全カードを取得して勝敗判定
    const { data: allCards } = await supabase
      .from('cards')
      .select('*')
      .eq('room_id', roomId);

    const winner = allCards
      ? checkWinner(
          allCards.map((c: any) => ({
            type: c.type as CardType,
            isRevealed: c.is_revealed,
          }))
        )
      : null;

    // 3. 現在のターンを取得
    const { data: room } = await supabase
      .from('rooms')
      .select('current_turn')
      .eq('id', roomId)
      .single();

    const currentTurn = room?.current_turn as Team;

    // 4. ターン変更判定
    let nextTurn: Team | null = currentTurn;

    if (card.type === CardType.ASSASSIN) {
      // 暗殺者を引いた → 相手チームの勝ち
      const assassinWinner =
        currentTurn === Team.RED ? Team.BLUE : Team.RED;

      await supabase
        .from('rooms')
        .update({
          status: RoomStatus.FINISHED,
          winner: assassinWinner,
        })
        .eq('id', roomId);

      return {
        card: {
          id: card.id,
          roomId: card.room_id,
          word: card.word,
          position: card.position,
          type: card.type as CardType,
          isRevealed: card.is_revealed,
          revealedBy: card.revealed_by,
        },
        nextTurn: null,
        winner: assassinWinner,
      };
    }

    if (card.type === CardType.NEUTRAL || card.type !== currentTurn) {
      // 中立または相手チームのカード → ターン終了
      nextTurn = currentTurn === Team.RED ? Team.BLUE : Team.RED;

      await supabase
        .from('rooms')
        .update({ current_turn: nextTurn })
        .eq('id', roomId);
    }

    // 5. 勝敗が決まった場合
    if (winner) {
      await supabase
        .from('rooms')
        .update({
          status: RoomStatus.FINISHED,
          winner,
        })
        .eq('id', roomId);

      nextTurn = null;
    }

    return {
      card: {
        id: card.id,
        roomId: card.room_id,
        word: card.word,
        position: card.position,
        type: card.type as CardType,
        isRevealed: card.is_revealed,
        revealedBy: card.revealed_by,
      },
      nextTurn,
      winner,
    };
  } catch (error) {
    console.error('[gameService] エラー:', error);
    throw error;
  }
}

/**
 * ターンをパス（終了）
 */
export async function passTurn(roomId: string, currentTurn: Team): Promise<Team> {
  try {
    const nextTurn = currentTurn === Team.RED ? Team.BLUE : Team.RED;

    const { error } = await supabase
      .from('rooms')
      .update({ current_turn: nextTurn })
      .eq('id', roomId);

    if (error) {
      console.error('[gameService] ターンパスエラー:', error);
      throw new Error('ターンのパスに失敗しました');
    }

    return nextTurn;
  } catch (error) {
    console.error('[gameService] エラー:', error);
    throw error;
  }
}

/**
 * ゲームデータを取得
 */
export async function getGameData(roomId: string) {
  try {
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .eq('room_id', roomId)
      .order('position');

    const { data: hints, error: hintsError } = await supabase
      .from('hints')
      .select('*, player:players(*)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false });

    if (cardsError || hintsError) {
      throw new Error('ゲームデータの取得に失敗しました');
    }

    return {
      cards:
        cards?.map((c: any) => ({
          id: c.id,
          roomId: c.room_id,
          word: c.word,
          position: c.position,
          type: c.type as CardType,
          isRevealed: c.is_revealed,
          revealedBy: c.revealed_by,
        })) || [],
      hints:
        hints?.map((h: any) => ({
          id: h.id,
          roomId: h.room_id,
          playerId: h.player_id,
          word: h.word,
          count: h.count,
          team: h.team as Team,
          createdAt: h.created_at,
          player: h.player
            ? {
                id: h.player.id,
                roomId: h.player.room_id,
                nickname: h.player.nickname,
                team: h.player.team,
                role: h.player.role,
                sessionId: h.player.session_id,
                isHost: h.player.is_host,
                spectatorView: h.player.spectator_view,
                createdAt: h.player.created_at,
              }
            : undefined,
        })) || [],
    };
  } catch (error) {
    console.error('[gameService] エラー:', error);
    throw error;
  }
}

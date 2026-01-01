import { supabase } from '@/lib/supabase';
import { Room, Player, CreateRoomResponse, RoomStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// ルームコード生成（6桁の英数字）
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// セッションID生成（ブラウザごとにユニーク）
export function getSessionId(): string {
  let sessionId = localStorage.getItem('codenames_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('codenames_session_id', sessionId);
  }
  return sessionId;
}

/**
 * ルームを作成
 */
export async function createRoom(params: {
  roomName: string;
  hostNickname: string;
  wordPackId: string;
  isPublic: boolean;
  timerSeconds: number | null;
}): Promise<CreateRoomResponse> {
  const { roomName, hostNickname, wordPackId, isPublic, timerSeconds } = params;
  const code = generateRoomCode();
  const sessionId = getSessionId();

  try {
    const roomId = uuidv4();

    // 1. ルーム作成
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        id: roomId,
        code,
        name: roomName,
        status: RoomStatus.WAITING,
        is_public: isPublic,
        word_pack_id: wordPackId,
        timer_seconds: timerSeconds,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (roomError || !room) {
      console.error('[roomService] ルーム作成エラー:', roomError);
      throw new Error('ルームの作成に失敗しました');
    }

    // 2. ホストプレイヤー作成
    const playerId = uuidv4();
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        id: playerId,
        room_id: room.id,
        nickname: hostNickname,
        team: 'spectator',
        role: null,
        session_id: sessionId,
        is_host: true,
        spectator_view: 'operative',
      })
      .select()
      .single();

    if (playerError || !player) {
      console.error('[roomService] プレイヤー作成エラー:', playerError);
      // ルームも削除
      await supabase.from('rooms').delete().eq('id', room.id);
      throw new Error('プレイヤーの作成に失敗しました');
    }

    return {
      room: {
        id: room.id,
        code: room.code,
        name: room.name,
        status: room.status as RoomStatus,
        isPublic: room.is_public,
        wordPackId: room.word_pack_id,
        currentTurn: room.current_turn,
        winner: room.winner,
        timerSeconds: room.timer_seconds,
        createdAt: room.created_at,
        updatedAt: room.updated_at,
      },
      player: {
        id: player.id,
        roomId: player.room_id,
        nickname: player.nickname,
        team: player.team,
        role: player.role,
        sessionId: player.session_id,
        isHost: player.is_host,
        isAI: player.is_ai || false,
        spectatorView: player.spectator_view,
        createdAt: player.created_at,
      },
    };
  } catch (error) {
    console.error('[roomService] エラー:', error);
    throw error;
  }
}

/**
 * ルームコードでルーム情報を取得
 */
export async function getRoomByCode(code: string): Promise<Room | null> {
  try {
    // ルーム情報を取得
    const { data, error } = await supabase
      .from('rooms')
      .select(
        `
        *,
        word_pack:word_packs(*)
      `
      )
      .eq('code', code.toUpperCase())
      .single();

    if (error || !data) {
      console.error('[roomService] ルーム取得エラー:', error);
      return null;
    }

    // プレイヤー情報を別クエリで取得
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', data.id);

    if (playersError) {
      console.error('[roomService] プレイヤー取得エラー:', playersError);
    }

    const players = playersData || [];

    return {
      id: data.id,
      code: data.code,
      name: data.name,
      status: data.status as RoomStatus,
      isPublic: data.is_public,
      wordPackId: data.word_pack_id,
      currentTurn: data.current_turn,
      winner: data.winner,
      timerSeconds: data.timer_seconds,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      wordPack: data.word_pack
        ? {
            id: data.word_pack.id,
            name: data.word_pack.name,
            description: data.word_pack.description,
            isPublic: data.word_pack.is_public,
            isDefault: data.word_pack.is_default,
            language: data.word_pack.language,
            creatorSessionId: data.word_pack.creator_session_id,
            createdAt: data.word_pack.created_at,
          }
        : undefined,
      players: players.map((p: any) => ({
        id: p.id,
        roomId: p.room_id,
        nickname: p.nickname,
        team: p.team,
        role: p.role,
        sessionId: p.session_id,
        isHost: p.is_host,
        isAI: p.is_ai || false,
        spectatorView: p.spectator_view,
        createdAt: p.created_at,
      })),
    };
  } catch (error) {
    console.error('[roomService] エラー:', error);
    return null;
  }
}

/**
 * ルームに参加
 */
export async function joinRoom(params: {
  roomId: string;
  nickname: string;
}): Promise<Player> {
  const { roomId, nickname } = params;
  const sessionId = getSessionId();

  try {
    // 既に参加済みかチェック
    const { data: existingPlayer } = await supabase
      .from('players')
      .select()
      .eq('room_id', roomId)
      .eq('session_id', sessionId)
      .single();

    if (existingPlayer) {
      // 既に参加済み（ニックネーム更新のみ）
      const { data: updated, error } = await supabase
        .from('players')
        .update({ nickname })
        .eq('id', existingPlayer.id)
        .select()
        .single();

      if (error || !updated) {
        throw new Error('プレイヤー情報の更新に失敗しました');
      }

      return {
        id: updated.id,
        roomId: updated.room_id,
        nickname: updated.nickname,
        team: updated.team,
        role: updated.role,
        sessionId: updated.session_id,
        isHost: updated.is_host,
        isAI: updated.is_ai || false,
        spectatorView: updated.spectator_view,
        createdAt: updated.created_at,
      };
    }

    // 新規参加
    const playerId = uuidv4();
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        id: playerId,
        room_id: roomId,
        nickname,
        team: 'spectator',
        role: null,
        session_id: sessionId,
        is_host: false,
        spectator_view: 'operative',
      })
      .select()
      .single();

    if (playerError || !player) {
      console.error('[roomService] 参加エラー:', playerError);
      throw new Error('ルームへの参加に失敗しました');
    }

    return {
      id: player.id,
      roomId: player.room_id,
      nickname: player.nickname,
      team: player.team,
      role: player.role,
      sessionId: player.session_id,
      isHost: player.is_host,
      isAI: player.is_ai || false,
      spectatorView: player.spectator_view,
      createdAt: player.created_at,
    };
  } catch (error) {
    console.error('[roomService] エラー:', error);
    throw error;
  }
}

/**
 * 公開ルーム一覧を取得
 */
export async function getPublicRooms() {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select(
        `
        *,
        players(count)
      `
      )
      .eq('is_public', true)
      .eq('status', RoomStatus.WAITING)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[roomService] 公開ルーム取得エラー:', error);
      return [];
    }

    return (
      data?.map((room: any) => ({
        id: room.id,
        code: room.code,
        name: room.name,
        status: room.status as RoomStatus,
        isPublic: room.is_public,
        playerCount: room.players?.[0]?.count || 0,
        maxPlayers: 12,
        createdAt: room.created_at,
      })) || []
    );
  } catch (error) {
    console.error('[roomService] エラー:', error);
    return [];
  }
}

/**
 * 単語パック一覧を取得
 */
export async function getWordPacks() {
  try {
    const { data, error } = await supabase
      .from('word_packs')
      .select('*')
      .or('is_public.eq.true,is_default.eq.true')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[roomService] 単語パック取得エラー:', error);
      return [];
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
      })) || []
    );
  } catch (error) {
    console.error('[roomService] エラー:', error);
    return [];
  }
}

/**
 * プレイヤー情報を更新
 */
export async function updatePlayer(params: {
  playerId: string;
  team?: 'red' | 'blue' | 'spectator';
  role?: 'spymaster' | 'operative' | null;
  spectatorView?: 'spymaster' | 'operative';
}): Promise<Player> {
  const { playerId, team, role, spectatorView } = params;

  try {
    const updateData: any = {};
    if (team !== undefined) updateData.team = team;
    if (role !== undefined) updateData.role = role;
    if (spectatorView !== undefined) updateData.spectator_view = spectatorView;

    const { data, error } = await supabase
      .from('players')
      .update(updateData)
      .eq('id', playerId)
      .select()
      .single();

    if (error || !data) {
      console.error('[roomService] プレイヤー更新エラー:', error);
      throw new Error('プレイヤー情報の更新に失敗しました');
    }

    return {
      id: data.id,
      roomId: data.room_id,
      nickname: data.nickname,
      team: data.team,
      role: data.role,
      sessionId: data.session_id,
      isHost: data.is_host,
      isAI: data.is_ai || false,
      spectatorView: data.spectator_view,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('[roomService] エラー:', error);
    throw error;
  }
}

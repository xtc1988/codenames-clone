import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UseRealtimeOptions {
  roomCode: string;
  onPlayerJoined?: (player: any) => void;
  onPlayerLeft?: (playerId: string) => void;
  onPlayerUpdated?: (player: any) => void;
  onGameStarted?: (data: any) => void;
  onHintGiven?: (hint: any) => void;
  onCardRevealed?: (data: any) => void;
  onTurnChanged?: (turn: string) => void;
  onGameOver?: (data: any) => void;
}

/**
 * Supabase Realtimeチャンネルを管理するカスタムフック
 */
export function useRealtime(options: UseRealtimeOptions) {
  const {
    roomCode,
    onPlayerJoined,
    onPlayerLeft,
    onPlayerUpdated,
    onGameStarted,
    onHintGiven,
    onCardRevealed,
    onTurnChanged,
    onGameOver,
  } = options;

  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!roomCode) return;

    // チャンネル名: room:ROOM_CODE
    const channelName = `room:${roomCode}`;

    console.log('[useRealtime] チャンネル接続:', channelName);

    // Realtimeチャンネル作成
    const channel = supabase.channel(channelName);

    // Broadcast受信設定
    channel
      .on('broadcast', { event: 'player_joined' }, ({ payload }) => {
        console.log('[useRealtime] player_joined:', payload);
        onPlayerJoined?.(payload);
      })
      .on('broadcast', { event: 'player_left' }, ({ payload }) => {
        console.log('[useRealtime] player_left:', payload);
        onPlayerLeft?.(payload.playerId);
      })
      .on('broadcast', { event: 'player_updated' }, ({ payload }) => {
        console.log('[useRealtime] player_updated:', payload);
        onPlayerUpdated?.(payload);
      })
      .on('broadcast', { event: 'game_started' }, ({ payload }) => {
        console.log('[useRealtime] game_started:', payload);
        onGameStarted?.(payload);
      })
      .on('broadcast', { event: 'hint_given' }, ({ payload }) => {
        console.log('[useRealtime] hint_given:', payload);
        onHintGiven?.(payload);
      })
      .on('broadcast', { event: 'card_revealed' }, ({ payload }) => {
        console.log('[useRealtime] card_revealed:', payload);
        onCardRevealed?.(payload);
      })
      .on('broadcast', { event: 'turn_changed' }, ({ payload }) => {
        console.log('[useRealtime] turn_changed:', payload);
        onTurnChanged?.(payload.turn);
      })
      .on('broadcast', { event: 'game_over' }, ({ payload }) => {
        console.log('[useRealtime] game_over:', payload);
        onGameOver?.(payload);
      })
      .subscribe((status) => {
        console.log('[useRealtime] チャンネル状態:', status);
      });

    channelRef.current = channel;

    // クリーンアップ
    return () => {
      console.log('[useRealtime] チャンネル切断:', channelName);
      channel.unsubscribe();
    };
  }, [
    roomCode,
    onPlayerJoined,
    onPlayerLeft,
    onPlayerUpdated,
    onGameStarted,
    onHintGiven,
    onCardRevealed,
    onTurnChanged,
    onGameOver,
  ]);

  /**
   * イベントをBroadcast送信
   */
  const broadcast = async (event: string, payload: any) => {
    if (!channelRef.current) {
      console.error('[useRealtime] チャンネルが初期化されていません');
      return;
    }

    console.log(`[useRealtime] Broadcast送信: ${event}`, payload);

    await channelRef.current.send({
      type: 'broadcast',
      event,
      payload,
    });
  };

  return {
    broadcast,
  };
}

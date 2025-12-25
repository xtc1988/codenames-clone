import { supabase } from '@/lib/supabase';

/**
 * Realtime Broadcastヘルパー関数
 */

export async function broadcastPlayerJoined(roomCode: string, player: any) {
  const channel = supabase.channel(`room:${roomCode}`);
  await channel.send({
    type: 'broadcast',
    event: 'player_joined',
    payload: player,
  });
  console.log('[realtimeService] player_joined broadcast:', player);
}

export async function broadcastPlayerLeft(roomCode: string, playerId: string) {
  const channel = supabase.channel(`room:${roomCode}`);
  await channel.send({
    type: 'broadcast',
    event: 'player_left',
    payload: { playerId },
  });
  console.log('[realtimeService] player_left broadcast:', playerId);
}

export async function broadcastPlayerUpdated(roomCode: string, player: any) {
  const channel = supabase.channel(`room:${roomCode}`);
  await channel.send({
    type: 'broadcast',
    event: 'player_updated',
    payload: player,
  });
  console.log('[realtimeService] player_updated broadcast:', player);
}

export async function broadcastGameStarted(roomCode: string, data: any) {
  const channel = supabase.channel(`room:${roomCode}`);
  await channel.send({
    type: 'broadcast',
    event: 'game_started',
    payload: data,
  });
  console.log('[realtimeService] game_started broadcast:', data);
}

export async function broadcastHintGiven(roomCode: string, hint: any) {
  const channel = supabase.channel(`room:${roomCode}`);
  await channel.send({
    type: 'broadcast',
    event: 'hint_given',
    payload: hint,
  });
  console.log('[realtimeService] hint_given broadcast:', hint);
}

export async function broadcastCardRevealed(
  roomCode: string,
  data: {
    card: any;
    nextTurn: string | null;
    winner: string | null;
  }
) {
  const channel = supabase.channel(`room:${roomCode}`);
  await channel.send({
    type: 'broadcast',
    event: 'card_revealed',
    payload: data,
  });
  console.log('[realtimeService] card_revealed broadcast:', data);
}

export async function broadcastTurnChanged(roomCode: string, turn: string) {
  const channel = supabase.channel(`room:${roomCode}`);
  await channel.send({
    type: 'broadcast',
    event: 'turn_changed',
    payload: { turn },
  });
  console.log('[realtimeService] turn_changed broadcast:', turn);
}

export async function broadcastGameOver(
  roomCode: string,
  data: {
    winner: string;
    cards: any[];
  }
) {
  const channel = supabase.channel(`room:${roomCode}`);
  await channel.send({
    type: 'broadcast',
    event: 'game_over',
    payload: data,
  });
  console.log('[realtimeService] game_over broadcast:', data);
}

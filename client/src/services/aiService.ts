import { supabase } from '@/lib/supabase';
import { Card, Team, Player, PlayerRole, AIHintResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * AI Spymaster Service
 * Handles AI player creation and hint generation
 */

/**
 * Add an AI Spymaster to a team
 */
export async function addAISpymaster(roomId: string, team: Team): Promise<Player> {
  const aiPlayer = {
    id: uuidv4(),
    room_id: roomId,
    nickname: `AI ${team === Team.RED ? 'Berry' : 'Sky'}`,
    team: team,
    role: PlayerRole.SPYMASTER,
    session_id: `ai-${uuidv4()}`,
    is_host: false,
    is_ai: true,
    spectator_view: 'spymaster',
  };

  const { data, error } = await supabase
    .from('players')
    .insert(aiPlayer)
    .select()
    .single();

  if (error) {
    console.error('[aiService] Failed to add AI player:', error);
    throw new Error('AIプレイヤーの追加に失敗しました');
  }

  return {
    id: data.id,
    roomId: data.room_id,
    nickname: data.nickname,
    team: data.team as Team,
    role: data.role as PlayerRole,
    sessionId: data.session_id,
    isHost: data.is_host,
    isAI: data.is_ai,
    spectatorView: data.spectator_view,
    createdAt: data.created_at,
  };
}

/**
 * Remove an AI Spymaster from a team
 */
export async function removeAISpymaster(playerId: string): Promise<void> {
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', playerId)
    .eq('is_ai', true);

  if (error) {
    console.error('[aiService] Failed to remove AI player:', error);
    throw new Error('AIプレイヤーの削除に失敗しました');
  }
}

/**
 * Generate a hint using AI
 */
export async function generateAIHint(cards: Card[], team: Team): Promise<AIHintResponse> {
  console.log('[aiService] Generating AI hint for team:', team);

  // Prepare cards data for the Edge Function
  const cardData = cards.map((c) => ({
    word: c.word,
    type: c.type,
    isRevealed: c.isRevealed,
  }));

  const { data, error } = await supabase.functions.invoke('generate-hint', {
    body: {
      cards: cardData,
      team: team,
    },
  });

  if (error) {
    console.error('[aiService] Failed to generate AI hint:', error);
    throw new Error('AIヒントの生成に失敗しました');
  }

  console.log('[aiService] AI hint generated:', data);

  return {
    word: data.word,
    count: data.count,
    reason: data.reason,
  };
}

/**
 * Check if a player is an AI
 */
export function isAIPlayer(player: Player | null | undefined): boolean {
  return player?.isAI === true;
}

/**
 * Get the AI Spymaster for a team
 */
export function getAISpymaster(players: Player[], team: Team): Player | undefined {
  return players.find(
    (p) => p.team === team && p.role === PlayerRole.SPYMASTER && p.isAI
  );
}

/**
 * Check if the current turn belongs to an AI Spymaster
 */
export function isAITurn(players: Player[], currentTurn: Team | null): boolean {
  if (!currentTurn) return false;
  const aiSpymaster = getAISpymaster(players, currentTurn);
  return aiSpymaster !== undefined;
}

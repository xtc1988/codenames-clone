import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRoomByCode } from '@/services/roomService';
import { giveHint, revealCard, passTurn, getGameData } from '@/services/gameService';
import { generateAIHint, getAISpymaster, isAIPlayer } from '@/services/aiService';
import { usePlayerStore } from '@/stores/playerStore';
import { useRoomStore } from '@/stores/roomStore';
import { useGameStore } from '@/stores/gameStore';
import { Team, PlayerRole, RoomStatus, Player } from '@/types';
import { getTeamCounts } from '@/utils/gameLogic';
import GameCard from '@/components/game/GameCard';
import { useRealtime } from '@/hooks/useRealtime';
import { broadcastHintGiven, broadcastCardRevealed, broadcastTurnChanged } from '@/services/realtimeService';

function PlayerPanel({ players, currentTurn }: { players: Player[]; currentTurn: Team | null }) {
  const redAGENTS = players.filter(p => p.team === Team.RED);
  const blueAGENTS = players.filter(p => p.team === Team.BLUE);
  const spectators = players.filter(p => p.team === Team.SPECTATOR);

  const renderPlayer = (player: Player) => (
    <div key={player.id} className={"player-item " + (player.team === Team.RED ? "player-item-red" : player.team === Team.BLUE ? "player-item-blue" : "")}>
      <span className="font-medium text-forest-bark">
        {player.isAI && <span className="mr-1">🤖</span>}
        {player.nickname}
      </span>
      {player.role && (
        <span className={"role-badge ml-auto " + (player.role === PlayerRole.SPYMASTER ? "role-badge-spymaster" : "role-badge-operative")}>
          {player.role === PlayerRole.SPYMASTER ? "SM" : "OP"}
        </span>
      )}
    </div>
  );

  return (
    <div className="player-panel space-y-4">
      <h3 className="text-sm font-body font-bold text-neutral-muted uppercase tracking-wider">AGENTS</h3>
      <div className="space-y-1">
        <div className={"flex items-center gap-2 text-sm font-medium " + (currentTurn === Team.RED ? "text-team-berry" : "text-neutral-muted")}>
          <span className="team-dot team-dot-red"></span>
          <span>Berry Team</span>
          {currentTurn === Team.RED && <span className="text-xs">(Turn)</span>}
        </div>
        {redAGENTS.length > 0 ? redAGENTS.map(renderPlayer) : <div className="text-sm text-neutral-muted pl-5">No players</div>}
      </div>
      <div className="space-y-1">
        <div className={"flex items-center gap-2 text-sm font-medium " + (currentTurn === Team.BLUE ? "text-team-sky" : "text-neutral-muted")}>
          <span className="team-dot team-dot-blue"></span>
          <span>Sky Team</span>
          {currentTurn === Team.BLUE && <span className="text-xs">(Turn)</span>}
        </div>
        {blueAGENTS.length > 0 ? blueAGENTS.map(renderPlayer) : <div className="text-sm text-neutral-muted pl-5">No players</div>}
      </div>
      {spectators.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-muted">
            <span className="w-3 h-3 rounded-full bg-neutral-warm"></span>
            <span>Spectators</span>
          </div>
          {spectators.map(player => (<div key={player.id} className="player-item"><span className="text-neutral-muted">{player.nickname}</span></div>))}
        </div>
      )}
    </div>
  );
}

export default function GamePage() {
  const { code } = useParams<{ code: string }>();
  const currentPlayer = usePlayerStore((state) => state.currentPlayer);
  const { room, setRoom, setPlayers, players } = useRoomStore();
  const { cards, hints, currentTurn, winner, setCards, setHints, setCurrentTurn, setWinner } = useGameStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hintWord, setHintWord] = useState('');
  const [hintCount, setHintCount] = useState(1);
  const [submittingHint, setSubmittingHint] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const aiHintProcessed = useRef<string | null>(null);

  useRealtime({
    roomCode: code || '',
    onHintGiven: (hint) => {
      console.log('[GamePage] ヒント受信:', hint);
      setHints([hint, ...hints]);
    },
    onCardRevealed: (data) => {
      setCards(cards.map((c) => (c.id === data.card.id ? data.card : c)));
      if (data.nextTurn) setCurrentTurn(data.nextTurn);
      if (data.winner) setWinner(data.winner);
    },
    onTurnChanged: (turn) => {
      setCurrentTurn(turn as Team);
    },
    onGameOver: (data) => {
      setWinner(data.winner);
      setCards(data.cards);
    },
  });

  useEffect(() => {
    if (!code) return;
    loadGameData();
  }, [code]);

  // AI Spymaster hint generation
  const generateAIHintForTurn = useCallback(async () => {
    if (!room || !code || !currentTurn || winner || cards.length === 0) return;

    const aiSpymaster = getAISpymaster(players, currentTurn);
    if (!aiSpymaster) return;

    // Prevent duplicate hint generation for same turn
    const turnKey = `${currentTurn}-${hints.length}`;
    if (aiHintProcessed.current === turnKey) return;
    aiHintProcessed.current = turnKey;

    console.log('[GamePage] AI Spymaster detected, generating hint...');
    setAiGenerating(true);
    setError('');

    try {
      const aiHint = await generateAIHint(cards, currentTurn);
      console.log('[GamePage] AI hint generated:', aiHint);

      // Save hint to database
      const hint = await giveHint({
        roomId: room.id,
        playerId: aiSpymaster.id,
        word: aiHint.word,
        count: aiHint.count,
        team: currentTurn,
      });

      setHints([hint, ...hints]);
      await broadcastHintGiven(code, hint);
    } catch (err) {
      console.error('[GamePage] AI hint generation error:', err);
      setError('AIヒントの生成に失敗しました');
      aiHintProcessed.current = null; // Allow retry
    } finally {
      setAiGenerating(false);
    }
  }, [room, code, currentTurn, winner, cards, players, hints]);

  // Trigger AI hint when it's AI's turn
  useEffect(() => {
    if (loading || !currentTurn || winner) return;

    const aiSpymaster = getAISpymaster(players, currentTurn);
    if (aiSpymaster && cards.length > 0) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        generateAIHintForTurn();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, players, cards.length, loading, winner, generateAIHintForTurn]);

  // Check if opponent team has no human players (practice mode)
  const isPracticeMode = useCallback(() => {
    if (!currentPlayer) return false;
    const myTeam = currentPlayer.team;
    const opponentTeam = myTeam === Team.RED ? Team.BLUE : Team.RED;
    const opponentPlayers = players.filter(p => p.team === opponentTeam && !p.isAI);
    return opponentPlayers.length === 0;
  }, [currentPlayer, players]);

  // Auto-skip opponent turn in practice mode
  useEffect(() => {
    if (loading || !currentTurn || winner || !room || !code) return;
    if (!currentPlayer || currentPlayer.team === Team.SPECTATOR) return;

    const myTeam = currentPlayer.team;
    if (currentTurn !== myTeam && isPracticeMode()) {
      console.log('[GamePage] Practice mode: auto-skipping opponent turn');
      const timer = setTimeout(async () => {
        try {
          const nextTurn = await passTurn(room.id, currentTurn);
          setCurrentTurn(nextTurn);
          await broadcastTurnChanged(code, nextTurn);
        } catch (err) {
          console.error('[GamePage] Auto-skip error:', err);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, currentPlayer, loading, winner, room, code, isPracticeMode]);

  async function loadGameData() {
    if (!code) return;
    setLoading(true);
    setError('');
    aiHintProcessed.current = null;

    try {
      const roomData = await getRoomByCode(code);
      if (!roomData) {
        setError('ルームが見つかりません');
        setLoading(false);
        return;
      }

      setRoom(roomData);
      setPlayers(roomData.players || []);
      setCurrentTurn(roomData.currentTurn);
      setWinner(roomData.winner);

      if (roomData.status === RoomStatus.PLAYING || roomData.status === RoomStatus.FINISHED) {
        const gameData = await getGameData(roomData.id);
        setCards(gameData.cards);
        setHints(gameData.hints);
      } else {
        setError('Game has not started yet');
      }
    } catch (err) {
      setError('Failed to load game data');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmitHint = async () => {
    if (!currentPlayer || !room || !hintWord.trim() || !code) return;
    setSubmittingHint(true);
    setError('');

    try {
      const hint = await giveHint({
        roomId: room.id,
        playerId: currentPlayer.id,
        word: hintWord.trim(),
        count: hintCount,
        team: currentPlayer.team,
      });
      setHints([hint, ...hints]);
      setHintWord('');
      setHintCount(1);
      await broadcastHintGiven(code, hint);
    } catch (err) {
      setError('Failed to send hint');
    } finally {
      setSubmittingHint(false);
    }
  };

  const handleCardSelect = async (card: typeof cards[0]) => {
    if (!currentPlayer || !room || card.isRevealed || !code) return;

    try {
      const result = await revealCard({
        cardId: card.id,
        playerId: currentPlayer.id,
        roomId: room.id,
      });
      setCards(cards.map((c) => c.id === result.card.id ? result.card : c));
      if (result.nextTurn) setCurrentTurn(result.nextTurn);
      if (result.winner) setWinner(result.winner);
      await broadcastCardRevealed(code, {
        card: result.card,
        nextTurn: result.nextTurn,
        winner: result.winner,
      });
    } catch (err) {
      setError('Failed to select card');
    }
  };

  const handlePassTurn = async () => {
    if (!room || !currentTurn || !code) return;
    try {
      const nextTurn = await passTurn(room.id, currentTurn);
      setCurrentTurn(nextTurn);
      await broadcastTurnChanged(code, nextTurn);
    } catch (err) {
      setError('Failed to pass turn');
    }
  };

  const isSpymaster = currentPlayer?.role === PlayerRole.SPYMASTER;
  const isCurrentPlayerTurn = currentPlayer?.team === currentTurn;
  const canGiveHint = isSpymaster && isCurrentPlayerTurn && !winner && !isAIPlayer(currentPlayer);
  const canSelectCard = !isSpymaster && isCurrentPlayerTurn && !winner;
  const teamCounts = cards.length > 0 ? getTeamCounts(cards) : null;
  const latestHint = hints.length > 0 ? hints[0] : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-forest-bg">
        <p className="text-neutral-muted">Loading game...</p>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md">
          <p className="text-team-berry mb-4">{error}</p>
          <Link to={`/room/${code}`} className="btn-primary inline-block">Back to Lobby</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-6 bg-forest-bg">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex gap-6">
          <div className="hidden lg:block w-64 flex-shrink-0">
            <PlayerPanel players={players} currentTurn={currentTurn} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <Link to={`/room/${code}`} className="text-team-sky hover:text-team-sky-light hover:underline transition-colors text-sm">
                Back to Lobby
              </Link>
              <button onClick={loadGameData} className="btn-secondary text-sm px-3 py-1">Refresh</button>
            </div>

            <div className="card mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-lg font-bold">RED: {teamCounts?.red.remaining || 0}/{teamCounts?.red.total || 0}</div>
                  <div className="text-lg font-bold">BLUE: {teamCounts?.blue.remaining || 0}/{teamCounts?.blue.total || 0}</div>
                </div>
                <div className="text-lg font-bold">
                  {winner ? (
                    <span className="text-forest-bark uppercase tracking-wider">
                      {winner === Team.RED ? ' Berry Team' : ' Sky Team'} Wins!
                    </span>
                  ) : (
                    <span>
                      ACTIVE:{' '}
                      {currentTurn === Team.RED ? (
                        <span className="text-team-berry"> BERRY TEAM</span>
                      ) : (
                        <span className="text-team-sky"> SKY TEAM</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-team-berry/10 border border-rose-500/30 text-team-berry rounded">{error}</div>
            )}

            {/* AI Generating Indicator */}
            {aiGenerating && (
              <div className="card mb-4 bg-forest-primary/10 border-2 border-forest-primary/30">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-forest-primary border-t-transparent"></div>
                  <p className="text-forest-primary font-medium">🤖 AIがヒントを考えています...</p>
                </div>
              </div>
            )}

            {latestHint && (
              <div className="card mb-4 hint-display">
                <p className="text-lg font-bold">
                  TRANSMISSION: "{latestHint.word}" {latestHint.count}
                </p>
                <p className="text-sm text-neutral-muted">
                  by {latestHint.player?.isAI && '🤖 '}{latestHint.player?.nickname} ({latestHint.team === Team.RED ? ' Berry' : ' Sky'})
                </p>
              </div>
            )}

            {canGiveHint && (
              <div className="card mb-4 bg-gradient-to-r bg-forest-moss/10">
                <h3 className="font-bold mb-2">Give a Hint</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hintWord}
                    onChange={(e) => setHintWord(e.target.value)}
                    placeholder="Enter your hint word..."
                    className="input-field flex-1"
                    maxLength={100}
                  />
                  <input
                    type="number"
                    value={hintCount}
                    onChange={(e) => setHintCount(Number(e.target.value))}
                    className="input-field w-20"
                    min={0}
                    max={9}
                  />
                  <button
                    onClick={handleSubmitHint}
                    disabled={!hintWord.trim() || submittingHint}
                    className="btn-primary px-6"
                  >
                    Send Hint
                  </button>
                </div>
              </div>
            )}

            <div className="card mb-4">
              <div className="game-board">
                {cards.map((card) => (
                  <GameCard
                    key={card.id}
                    card={card}
                    isSpymaster={isSpymaster}
                    onSelect={handleCardSelect}
                    disabled={!canSelectCard}
                  />
                ))}
              </div>
            </div>

            {canSelectCard && (
              <div className="card bg-gradient-to-r bg-forest-cream">
                <button onClick={handlePassTurn} className="btn-secondary w-full text-lg py-3">
                  End Turn (Pass)
                </button>
              </div>
            )}

            {currentPlayer?.team === Team.SPECTATOR && (
              <div className="card text-center">
                <p className="text-neutral-muted">You are spectating this game</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

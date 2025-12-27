import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRoomByCode } from '@/services/roomService';
import { giveHint, revealCard, passTurn, getGameData } from '@/services/gameService';
import { usePlayerStore } from '@/stores/playerStore';
import { useRoomStore } from '@/stores/roomStore';
import { useGameStore } from '@/stores/gameStore';
import { Team, PlayerRole, RoomStatus, Player } from '@/types';
import { getTeamCounts } from '@/utils/gameLogic';
import GameCard from '@/components/game/GameCard';
import { useRealtime } from '@/hooks/useRealtime';
import {
  broadcastHintGiven,
  broadcastCardRevealed,
  broadcastTurnChanged,
} from '@/services/realtimeService';


function PlayerPanel({ players, currentTurn }: { players: Player[]; currentTurn: Team | null }) {
  const redPlayers = players.filter(p => p.team === Team.RED);
  const bluePlayers = players.filter(p => p.team === Team.BLUE);
  const spectators = players.filter(p => p.team === Team.SPECTATOR);

  const renderPlayer = (player: Player) => (
    <div key={player.id} className={"player-item " + (player.team === Team.RED ? "player-item-red" : player.team === Team.BLUE ? "player-item-blue" : "")}>
      <span className="font-medium text-ink-black">{player.nickname}</span>
      {player.role && (
        <span className={"role-badge ml-auto " + (player.role === PlayerRole.SPYMASTER ? "role-badge-spymaster" : "role-badge-operative")}>
          {player.role === PlayerRole.SPYMASTER ? "SM" : "OP"}
        </span>
      )}
    </div>
  );

  return (
    <div className="player-panel space-y-4">
      <h3 className="text-sm font-typewriter font-bold text-ink-gray uppercase tracking-wider">Players</h3>
      <div className="space-y-1">
        <div className={"flex items-center gap-2 text-sm font-medium " + (currentTurn === Team.RED ? "text-team-red" : "text-ink-gray")}>
          <span className="team-dot team-dot-red"></span>
          <span>Red Team</span>
          {currentTurn === Team.RED && <span className="text-xs">(Turn)</span>}
        </div>
        {redPlayers.length > 0 ? redPlayers.map(renderPlayer) : <div className="text-sm text-ink-gray pl-5">No players</div>}
      </div>
      <div className="space-y-1">
        <div className={"flex items-center gap-2 text-sm font-medium " + (currentTurn === Team.BLUE ? "text-team-blue" : "text-ink-gray")}>
          <span className="team-dot team-dot-blue"></span>
          <span>Blue Team</span>
          {currentTurn === Team.BLUE && <span className="text-xs">(Turn)</span>}
        </div>
        {bluePlayers.length > 0 ? bluePlayers.map(renderPlayer) : <div className="text-sm text-ink-gray pl-5">No players</div>}
      </div>
      {spectators.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium text-ink-gray">
            <span className="w-3 h-3 rounded-full bg-ink-light"></span>
            <span>Spectators</span>
          </div>
          {spectators.map(player => (<div key={player.id} className="player-item"><span className="text-ink-gray">{player.nickname}</span></div>))}
        </div>
      )}
    </div>
  );
}

export default function GamePage() {
  const { code } = useParams<{ code: string }>();

  const currentPlayer = usePlayerStore((state) => state.currentPlayer);
  const { room, setRoom, setPlayers, players } = useRoomStore();
  const { cards, hints, currentTurn, winner, setCards, setHints, setCurrentTurn, setWinner } =
    useGameStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hintWord, setHintWord] = useState('');
  const [hintCount, setHintCount] = useState(1);
  const [submittingHint, setSubmittingHint] = useState(false);

  // Realtime統合
  useRealtime({
    roomCode: code || '',
    onHintGiven: (hint) => {
      console.log('[GamePage] ヒント受信:', hint);
      setHints([hint, ...hints]);
    },
    onCardRevealed: (data) => {
      console.log('[GamePage] カード公開受信:', data);
      // カード更新
      setCards(cards.map((c) => (c.id === data.card.id ? data.card : c)));
      // ターン更新
      if (data.nextTurn) {
        setCurrentTurn(data.nextTurn);
      }
      // 勝者更新
      if (data.winner) {
        setWinner(data.winner);
      }
    },
    onTurnChanged: (turn) => {
      console.log('[GamePage] ターン変更受信:', turn);
      setCurrentTurn(turn as Team);
    },
    onGameOver: (data) => {
      console.log('[GamePage] ゲーム終了受信:', data);
      setWinner(data.winner);
      setCards(data.cards);
    },
  });

  // ゲームデータ読み込み
  useEffect(() => {
    if (!code) return;
    loadGameData();
  }, [code]);

  async function loadGameData() {
    if (!code) return;

    setLoading(true);
    setError('');

    try {
      console.log('[GamePage] ゲームデータ読み込み開始');
      const roomData = await getRoomByCode(code);

      if (!roomData) {
        console.error('[GamePage] Room not found');
        setError('ルームが見つかりません');
        setLoading(false);
        return;
      }

      console.log('[GamePage] ルーム情報取得:', {
        status: roomData.status,
        isHost: currentPlayer?.isHost,
        playerId: currentPlayer?.id,
      });

      setRoom(roomData);
      setPlayers(roomData.players || []);
      setCurrentTurn(roomData.currentTurn);
      setWinner(roomData.winner);

      // ゲームデータ取得
      if (roomData.status === RoomStatus.PLAYING || roomData.status === RoomStatus.FINISHED) {
        console.log('[GamePage] ゲームデータ取得開始');
        const gameData = await getGameData(roomData.id);
        console.log('[GamePage] ゲームデータ取得完了:', {
          cardsCount: gameData.cards.length,
          hintsCount: gameData.hints.length,
        });
        setCards(gameData.cards);
        setHints(gameData.hints);
      } else {
        console.warn('[GamePage] ゲームが開始されていません。ステータス:', roomData.status);
        setError('Game has not started yet');
      }
    } catch (err) {
      console.error('[GamePage] エラー:', err);
      setError('Failed to load game data');
    } finally {
      setLoading(false);
    }
  }

  // ヒントSend
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

      // Broadcast送信
      await broadcastHintGiven(code, hint);
    } catch (err) {
      console.error('[GamePage] ヒント送信エラー:', err);
      setError('Failed to send hint');
    } finally {
      setSubmittingHint(false);
    }
  };

  // カード選択
  const handleCardSelect = async (card: typeof cards[0]) => {
    if (!currentPlayer || !room || card.isRevealed || !code) return;

    try {
      const result = await revealCard({
        cardId: card.id,
        playerId: currentPlayer.id,
        roomId: room.id,
      });

      // カード更新
      setCards(
        cards.map((c) =>
          c.id === result.card.id ? result.card : c
        )
      );

      // ターン更新
      if (result.nextTurn) {
        setCurrentTurn(result.nextTurn);
      }

      // 勝者更新
      if (result.winner) {
        setWinner(result.winner);
      }

      // Broadcast送信
      await broadcastCardRevealed(code, {
        card: result.card,
        nextTurn: result.nextTurn,
        winner: result.winner,
      });
    } catch (err) {
      console.error('[GamePage] カード選択エラー:', err);
      setError('Failed to select card');
    }
  };

  // ターンパス
  const handlePassTurn = async () => {
    if (!room || !currentTurn || !code) return;

    try {
      const nextTurn = await passTurn(room.id, currentTurn);
      setCurrentTurn(nextTurn);

      // Broadcast送信
      await broadcastTurnChanged(code, nextTurn);
    } catch (err) {
      console.error('[GamePage] ターンパスエラー:', err);
      setError('Failed to pass turn');
    }
  };

  // 役割判定
  const isSpymaster = currentPlayer?.role === PlayerRole.SPYMASTER;
  const isCurrentPlayerTurn = currentPlayer?.team === currentTurn;
  const canGiveHint = isSpymaster && isCurrentPlayerTurn && !winner;
  const canSelectCard = !isSpymaster && isCurrentPlayerTurn && !winner;

  // チームカウント
  const teamCounts = cards.length > 0 ? getTeamCounts(cards) : null;

  // 最新のヒント
  const latestHint = hints.length > 0 ? hints[0] : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper-cream">
        <p className="text-ink-gray">Loading game...</p>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md">
          <p className="text-team-red mb-4">{error}</p>
          <Link to={`/room/${code}`} className="btn-primary inline-block">
            Back to Lobby
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-6 bg-paper-cream">
      <div className="max-w-[1600px] mx-auto"><div className="flex gap-6"><div className="hidden lg:block w-64 flex-shrink-0"><PlayerPanel players={players} currentTurn={currentTurn} /></div><div className="flex-1 min-w-0">
        {/* ヘッダー */}
        <div className="mb-4 flex items-center justify-between">
          <Link to={`/room/${code}`} className="text-team-blue hover:text-team-blue-light hover:underline transition-colors text-sm">
            ロビーに戻る
          </Link>
          <button onClick={loadGameData} className="btn-secondary text-sm px-3 py-1">
            Refresh
          </button>
        </div>

        {/* スコアボード */}
        <div className="card mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-lg font-bold">
                Red: {teamCounts?.red.remaining || 0}/{teamCounts?.red.total || 0}
              </div>
              <div className="text-lg font-bold">
                Blue: {teamCounts?.blue.remaining || 0}/{teamCounts?.blue.total || 0}
              </div>
            </div>

            <div className="text-lg font-bold">
              {winner ? (
                <span className="text-ink-black uppercase tracking-wider">
                   {winner === Team.RED ? ' Red Team' : ' Blue Team'} Wins!
                </span>
              ) : (
                <span>
                  Turn:{' '}
                  {currentTurn === Team.RED ? (
                    <span className="text-team-red"> 赤チーム</span>
                  ) : (
                    <span className="text-team-blue"> 青チーム</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-team-red/20 border border-rose-500/30 text-team-red rounded">
            {error}
          </div>
        )}

        {/* ヒント表示 */}
        {latestHint && (
          <div className="card mb-4 hint-display ">
            <p className="text-lg font-bold">
               Hint: "{latestHint.word}" {latestHint.count}
            </p>
            <p className="text-sm text-ink-gray">
              by {latestHint.player?.nickname} ({latestHint.team === Team.RED ? ' 赤' : ' 青'})
            </p>
          </div>
        )}

        {/* ヒント入力（スパイマスター用） */}
        {canGiveHint && (
          <div className="card mb-4 bg-gradient-to-r bg-paper-aged">
            <h3 className="font-bold mb-2">Give a Hint</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={hintWord}
                onChange={(e) => setHintWord(e.target.value)}
                placeholder="Enter hint word"
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
                送信
              </button>
            </div>
          </div>
        )}

        {/* ゲームボード */}
        <div className="card mb-4">
          <div className="grid grid-cols-5 gap-2 md:gap-3">
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

        {/* ターンパスボタン */}
        {canSelectCard && (
          <div className="card bg-gradient-to-r bg-paper-light">
            <button
              onClick={handlePassTurn}
              className="btn-secondary w-full text-lg py-3"
            >
              End Turn (Pass)
            </button>
          </div>
        )}

        {/* 観戦者メッセージ */}
        {currentPlayer?.team === Team.SPECTATOR && (
          <div className="card text-center">
            <p className="text-ink-gray">You are spectating</p>
          </div>
        )}
      </div></div></div>
    </div>
  );
}

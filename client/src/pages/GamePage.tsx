import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRoomByCode } from '@/services/roomService';
import { startGame, giveHint, revealCard, passTurn, getGameData } from '@/services/gameService';
import { usePlayerStore } from '@/stores/playerStore';
import { useRoomStore } from '@/stores/roomStore';
import { useGameStore } from '@/stores/gameStore';
import { Team, PlayerRole, RoomStatus } from '@/types';
import { getTeamCounts } from '@/utils/gameLogic';
import GameCard from '@/components/game/GameCard';

export default function GamePage() {
  const { code } = useParams<{ code: string }>();

  const currentPlayer = usePlayerStore((state) => state.currentPlayer);
  const { room, setRoom, setPlayers } = useRoomStore();
  const { cards, hints, currentTurn, winner, setCards, setHints, setCurrentTurn, setWinner } =
    useGameStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hintWord, setHintWord] = useState('');
  const [hintCount, setHintCount] = useState(1);
  const [submittingHint, setSubmittingHint] = useState(false);

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

      // ゲームが開始されていない場合は開始
      if (roomData.status === RoomStatus.WAITING && currentPlayer?.isHost) {
        const newCards = await startGame(roomData.id, roomData.wordPackId);
        setCards(newCards);
      } else if (roomData.status === RoomStatus.PLAYING || roomData.status === RoomStatus.FINISHED) {
        // ゲームデータ取得
        const gameData = await getGameData(roomData.id);
        setCards(gameData.cards);
        setHints(gameData.hints);
      }
    } catch (err) {
      console.error('[GamePage] エラー:', err);
      setError('ゲームデータの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }

  // ヒント送信
  const handleSubmitHint = async () => {
    if (!currentPlayer || !room || !hintWord.trim()) return;

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
    } catch (err) {
      console.error('[GamePage] ヒント送信エラー:', err);
      setError('ヒントの送信に失敗しました');
    } finally {
      setSubmittingHint(false);
    }
  };

  // カード選択
  const handleCardSelect = async (card: typeof cards[0]) => {
    if (!currentPlayer || !room || card.isRevealed) return;

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
    } catch (err) {
      console.error('[GamePage] カード選択エラー:', err);
      setError('カードの選択に失敗しました');
    }
  };

  // ターンパス
  const handlePassTurn = async () => {
    if (!room || !currentTurn) return;

    try {
      const nextTurn = await passTurn(room.id, currentTurn);
      setCurrentTurn(nextTurn);
    } catch (err) {
      console.error('[GamePage] ターンパスエラー:', err);
      setError('ターンのパスに失敗しました');
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">ゲームを読み込み中...</p>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to={`/room/${code}`} className="btn-primary inline-block">
            ロビーに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-4 flex items-center justify-between">
          <Link to={`/room/${code}`} className="text-blue-600 hover:underline text-sm">
            ← ロビーに戻る
          </Link>
          <button onClick={loadGameData} className="btn-secondary text-sm px-3 py-1">
            🔄 更新
          </button>
        </div>

        {/* スコアボード */}
        <div className="card mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-lg font-bold">
                🔴 赤: {teamCounts?.red.remaining || 0}/{teamCounts?.red.total || 0}
              </div>
              <div className="text-lg font-bold">
                🔵 青: {teamCounts?.blue.remaining || 0}/{teamCounts?.blue.total || 0}
              </div>
            </div>

            <div className="text-lg font-bold">
              {winner ? (
                <span className="text-green-600">
                  🎉 {winner === Team.RED ? '🔴 赤チーム' : '🔵 青チーム'}の勝利！
                </span>
              ) : (
                <span>
                  ターン:{' '}
                  {currentTurn === Team.RED ? (
                    <span className="text-red-600">🔴 赤チーム</span>
                  ) : (
                    <span className="text-blue-600">🔵 青チーム</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* ヒント表示 */}
        {latestHint && (
          <div className="card mb-4 bg-blue-50 border-2 border-blue-300">
            <p className="text-lg font-bold">
              💡 ヒント: 「{latestHint.word}」 {latestHint.count}
            </p>
            <p className="text-sm text-gray-600">
              by {latestHint.player?.nickname} ({latestHint.team === Team.RED ? '🔴 赤' : '🔵 青'})
            </p>
          </div>
        )}

        {/* ヒント入力（スパイマスター用） */}
        {canGiveHint && (
          <div className="card mb-4 bg-green-50 border-2 border-green-300">
            <h3 className="font-bold mb-2">ヒントを出す</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={hintWord}
                onChange={(e) => setHintWord(e.target.value)}
                placeholder="ヒント単語"
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
          <div className="card bg-yellow-50 border-2 border-yellow-300">
            <button
              onClick={handlePassTurn}
              className="btn-secondary w-full text-lg py-3"
            >
              ターン終了（パス）
            </button>
          </div>
        )}

        {/* 観戦者メッセージ */}
        {currentPlayer?.team === Team.SPECTATOR && (
          <div className="card text-center">
            <p className="text-gray-600">観戦中です</p>
          </div>
        )}
      </div>
    </div>
  );
}

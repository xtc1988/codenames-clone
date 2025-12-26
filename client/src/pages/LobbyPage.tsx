import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRoomByCode, updatePlayer } from '@/services/roomService';
import { usePlayerStore } from '@/stores/playerStore';
import { useRoomStore } from '@/stores/roomStore';
import { Team, PlayerRole } from '@/types';
import { useRealtime } from '@/hooks/useRealtime';
import { broadcastPlayerUpdated, broadcastGameStarted } from '@/services/realtimeService';

export default function LobbyPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const currentPlayer = usePlayerStore((state) => state.currentPlayer);
  const setCurrentPlayer = usePlayerStore((state) => state.setCurrentPlayer);
  const { room, players, setRoom, setPlayers } = useRoomStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ルーム情報取得（useCallbackで安定化）
  const loadRoom = useCallback(async () => {
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
    } catch (err) {
      console.error('[LobbyPage] エラー:', err);
      setError('ルーム情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [code, setRoom, setPlayers]);

  // Realtime統合
  useRealtime({
    roomCode: code || '',
    onPlayerUpdated: useCallback((player) => {
      console.log('[LobbyPage] プレイヤー更新受信:', player);
      // プレイヤーリストを再読み込み
      loadRoom();
    }, [loadRoom]),
    onGameStarted: useCallback(() => {
      console.log('[LobbyPage] ゲーム開始受信');
      // ゲーム画面に遷移
      navigate(`/room/${code}/game`);
    }, [navigate, code]),
  });

  // ルーム情報取得
  useEffect(() => {
    if (!code) {
      setError('ルームコードが指定されていません');
      setLoading(false);
      return;
    }

    loadRoom();
  }, [code, loadRoom]);

  // チーム変更
  const handleTeamChange = async (team: Team) => {
    if (!currentPlayer || !code) return;

    try {
      const updated = await updatePlayer({
        playerId: currentPlayer.id,
        team,
        role: team === Team.SPECTATOR ? null : currentPlayer.role,
      });

      setCurrentPlayer(updated);
      await loadRoom();

      // Broadcast送信
      await broadcastPlayerUpdated(code, updated);
    } catch (err) {
      console.error('[LobbyPage] チーム変更エラー:', err);
      setError('チーム変更に失敗しました');
    }
  };

  // 役割変更
  const handleRoleChange = async (role: PlayerRole | null) => {
    if (!currentPlayer || !code) return;

    try {
      const updated = await updatePlayer({
        playerId: currentPlayer.id,
        role,
      });

      setCurrentPlayer(updated);
      await loadRoom();

      // Broadcast送信
      await broadcastPlayerUpdated(code, updated);
    } catch (err) {
      console.error('[LobbyPage] 役割変更エラー:', err);
      setError('役割変更に失敗しました');
    }
  };

  // ゲーム開始条件チェック
  const canStartGame = (): boolean => {
    if (!currentPlayer?.isHost) return false;

    const redPlayers = players.filter((p) => p.team === Team.RED);
    const bluePlayers = players.filter((p) => p.team === Team.BLUE);

    const redSpymaster = redPlayers.find((p) => p.role === PlayerRole.SPYMASTER);
    const blueSpymaster = bluePlayers.find((p) => p.role === PlayerRole.SPYMASTER);

    return (
      redPlayers.length >= 1 &&
      bluePlayers.length >= 1 &&
      !!redSpymaster &&
      !!blueSpymaster
    );
  };

  const handleStartGame = async () => {
    if (!canStartGame() || !code) {
      setError('ゲームを開始できません。各チームに1人以上のプレイヤーとスパイマスターが必要です。');
      return;
    }

    try {
      // ゲーム開始通知をBroadcast
      await broadcastGameStarted(code, {
        roomCode: code,
        timestamp: new Date().toISOString(),
      });

      // ゲーム画面に遷移
      navigate(`/room/${code}/game`);
    } catch (err) {
      console.error('[LobbyPage] ゲーム開始エラー:', err);
      setError('ゲームの開始に失敗しました');
    }
  };

  // チーム別プレイヤー分類
  const redPlayers = players.filter((p) => p.team === Team.RED);
  const bluePlayers = players.filter((p) => p.team === Team.BLUE);
  const spectators = players.filter((p) => p.team === Team.SPECTATOR);

  const redSpymaster = redPlayers.find((p) => p.role === PlayerRole.SPYMASTER);
  const blueSpymaster = bluePlayers.find((p) => p.role === PlayerRole.SPYMASTER);
  const redOperatives = redPlayers.filter((p) => p.role === PlayerRole.OPERATIVE);
  const blueOperatives = bluePlayers.filter((p) => p.role === PlayerRole.OPERATIVE);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/" className="btn-primary inline-block">
            トップに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="text-blue-600 hover:underline text-sm">
            ← トップに戻る
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              ルームコード:
              <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 font-mono rounded">
                {room?.code}
              </span>
            </div>
            <button onClick={loadRoom} className="btn-secondary text-sm px-3 py-1">
              🔄 更新
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">{room?.name}</h1>
        <p className="text-gray-600 mb-6">
          単語パック: {room?.wordPack?.name || '読み込み中...'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* チーム選択 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 赤チーム */}
          <div className="card bg-red-50 border-2 border-red-300">
            <h2 className="text-xl font-bold text-red-700 mb-4">🔴 赤チーム</h2>

            {/* スパイマスター */}
            <div className="mb-4">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">👑 スパイマスター</h3>
              {redSpymaster ? (
                <div className="p-2 bg-white rounded border border-red-200">
                  {redSpymaster.nickname}
                  {redSpymaster.id === currentPlayer?.id && ' (あなた)'}
                </div>
              ) : (
                <div className="p-2 bg-gray-100 rounded text-gray-500 text-sm">
                  (空き)
                </div>
              )}
            </div>

            {/* オペレーティブ */}
            <div className="mb-4">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">🔍 オペレーティブ</h3>
              {redOperatives.length > 0 ? (
                <div className="space-y-1">
                  {redOperatives.map((p) => (
                    <div key={p.id} className="p-2 bg-white rounded border border-red-200 text-sm">
                      {p.nickname}
                      {p.id === currentPlayer?.id && ' (あなた)'}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2 bg-gray-100 rounded text-gray-500 text-sm">
                  (なし)
                </div>
              )}
            </div>

            {/* 選択ボタン */}
            {currentPlayer && (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    handleTeamChange(Team.RED);
                    handleRoleChange(PlayerRole.SPYMASTER);
                  }}
                  disabled={!!redSpymaster && redSpymaster.id !== currentPlayer.id}
                  className="btn-secondary w-full text-sm disabled:opacity-50"
                >
                  スパイマスターになる
                </button>
                <button
                  onClick={() => {
                    handleTeamChange(Team.RED);
                    handleRoleChange(PlayerRole.OPERATIVE);
                  }}
                  className="btn-secondary w-full text-sm"
                >
                  オペレーティブになる
                </button>
              </div>
            )}
          </div>

          {/* 青チーム */}
          <div className="card bg-blue-50 border-2 border-blue-300">
            <h2 className="text-xl font-bold text-blue-700 mb-4">🔵 青チーム</h2>

            {/* スパイマスター */}
            <div className="mb-4">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">👑 スパイマスター</h3>
              {blueSpymaster ? (
                <div className="p-2 bg-white rounded border border-blue-200">
                  {blueSpymaster.nickname}
                  {blueSpymaster.id === currentPlayer?.id && ' (あなた)'}
                </div>
              ) : (
                <div className="p-2 bg-gray-100 rounded text-gray-500 text-sm">
                  (空き)
                </div>
              )}
            </div>

            {/* オペレーティブ */}
            <div className="mb-4">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">🔍 オペレーティブ</h3>
              {blueOperatives.length > 0 ? (
                <div className="space-y-1">
                  {blueOperatives.map((p) => (
                    <div key={p.id} className="p-2 bg-white rounded border border-blue-200 text-sm">
                      {p.nickname}
                      {p.id === currentPlayer?.id && ' (あなた)'}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2 bg-gray-100 rounded text-gray-500 text-sm">
                  (なし)
                </div>
              )}
            </div>

            {/* 選択ボタン */}
            {currentPlayer && (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    handleTeamChange(Team.BLUE);
                    handleRoleChange(PlayerRole.SPYMASTER);
                  }}
                  disabled={!!blueSpymaster && blueSpymaster.id !== currentPlayer.id}
                  className="btn-secondary w-full text-sm disabled:opacity-50"
                >
                  スパイマスターになる
                </button>
                <button
                  onClick={() => {
                    handleTeamChange(Team.BLUE);
                    handleRoleChange(PlayerRole.OPERATIVE);
                  }}
                  className="btn-secondary w-full text-sm"
                >
                  オペレーティブになる
                </button>
              </div>
            )}
          </div>

          {/* 観戦者 */}
          <div className="card bg-gray-50 border-2 border-gray-300">
            <h2 className="text-xl font-bold text-gray-700 mb-4">👁 観戦者</h2>
            {spectators.length > 0 ? (
              <div className="space-y-1 mb-4">
                {spectators.map((p) => (
                  <div key={p.id} className="p-2 bg-white rounded border border-gray-200 text-sm">
                    {p.nickname}
                    {p.id === currentPlayer?.id && ' (あなた)'}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 bg-gray-100 rounded text-gray-500 text-sm mb-4">
                (なし)
              </div>
            )}

            {currentPlayer && (
              <button
                onClick={() => handleTeamChange(Team.SPECTATOR)}
                className="btn-secondary w-full text-sm"
              >
                観戦者になる
              </button>
            )}
          </div>
        </div>

        {/* ゲーム開始ボタン */}
        {currentPlayer?.isHost && (
          <div className="card bg-green-50 border-2 border-green-300">
            <button
              onClick={handleStartGame}
              disabled={!canStartGame()}
              className="btn-primary w-full text-lg py-4 disabled:bg-gray-400"
            >
              🎮 ゲームを開始する
            </button>
            {!canStartGame() && (
              <p className="text-sm text-red-600 mt-2 text-center">
                各チームに1人以上のプレイヤーとスパイマスターが必要です
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

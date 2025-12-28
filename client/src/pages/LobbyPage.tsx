import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRoomByCode, updatePlayer } from '@/services/roomService';
import { usePlayerStore } from '@/stores/playerStore';
import { useRoomStore } from '@/stores/roomStore';
import { Team, PlayerRole, Player } from '@/types';
import { useRealtime } from '@/hooks/useRealtime';

export default function LobbyPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const currentPlayer = usePlayerStore((state) => state.currentPlayer);
  const setCurrentPlayer = usePlayerStore((state) => state.setCurrentPlayer);
  const { room, players, setRoom, setPlayers, addPlayer, updatePlayer: updatePlayerInStore } = useRoomStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ルーム情報取得（useCallbackで安定化）
  const loadRoom = useCallback(async () => {
    if (!code) return;

    setLoading(true);
    setError('');

    try {
      console.log('[LobbyPage] loadRoom開始 @', new Date().toISOString());
      const roomData = await getRoomByCode(code);

      if (!roomData) {
        console.error('[LobbyPage] ルームが見つかりません');
        setError('ルームが見つかりません');
        setLoading(false);
        return;
      }

      console.log('[LobbyPage] getRoomByCode結果:', {
        playersCount: roomData.players?.length || 0,
        players: roomData.players?.map(p => ({ id: p.id, nickname: p.nickname, team: p.team, role: p.role })),
      });

      setRoom(roomData);
      setPlayers(roomData.players || []);

      console.log('[LobbyPage] setPlayers完了');
    } catch (err) {
      console.error('[LobbyPage] エラー:', err);
      setError('ルーム情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [code, setRoom, setPlayers]);

  // Realtime統合
  const { broadcast } = useRealtime({
    roomCode: code || '',
    onPlayerUpdated: useCallback((player: Player) => {
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

      // players配列を即座に更新（楽観的更新）
      const existingPlayer = players.find((p: Player) => p.id === updated.id);
      if (existingPlayer) {
        // 既存プレイヤーの更新
        updatePlayerInStore(updated.id, updated);
      } else {
        // 新規プレイヤーの追加
        addPlayer(updated);
      }

      // バックグラウンドでloadRoomを呼んで検証
      loadRoom();

      // Broadcast送信
      await broadcast('player_updated', updated);
    } catch (err) {
      console.error('[LobbyPage] チーム変更エラー:', err);
      setError('チーム変更に失敗しました');
    }
  };

  // チーム+役割を同時に変更（race condition回避）
  const handleTeamAndRoleChange = async (team: Team, role: PlayerRole | null) => {
    if (!currentPlayer || !code) return;

    try {
      const updated = await updatePlayer({
        playerId: currentPlayer.id,
        team,
        role: team === Team.SPECTATOR ? null : role,
      });

      setCurrentPlayer(updated);

      // players配列を即座に更新（楽観的更新）
      const existingPlayer = players.find((p: Player) => p.id === updated.id);
      if (existingPlayer) {
        // 既存プレイヤーの更新
        updatePlayerInStore(updated.id, updated);
      } else {
        // 新規プレイヤーの追加
        addPlayer(updated);
      }

      // バックグラウンドでloadRoomを呼んで検証
      loadRoom();

      // Broadcast送信
      await broadcast('player_updated', updated);
    } catch (err) {
      console.error('[LobbyPage] チーム・役割変更エラー:', err);
      setError('チーム・役割変更に失敗しました');
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
    if (!canStartGame() || !code || !room) {
      setError('ゲームを開始できません。各チームに1人以上のプレイヤーとスパイマスターが必要です。');
      return;
    }

    try {
      // ホストがカードを生成してゲームを開始
      console.log('[LobbyPage] ゲーム開始処理開始（ホスト）');
      const { startGame } = await import('@/services/gameService');
      await startGame(room.id, room.wordPackId);
      console.log('[LobbyPage] カード生成完了');

      // ゲーム開始通知をBroadcast
      await broadcast('game_started', {
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
        <p className="text-neutral-muted">読み込み中...</p>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md">
          <p className="text-riso-coral mb-4">{error}</p>
          <Link to="/" className="btn-primary inline-block">
            トップに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-paper-cream">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="text-riso-teal hover:underline text-sm">
            ← トップに戻る
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm text-neutral-muted">
              ルームコード:
              <span className="ml-2 px-3 py-1 bg-riso-teal/20 text-riso-teal-dark font-mono rounded">
                {room?.code}
              </span>
            </div>
            <button onClick={loadRoom} className="btn-secondary text-sm px-3 py-1">
              🔄 更新
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">{room?.name}</h1>
        <p className="text-neutral-muted mb-6">
          単語パック: {room?.wordPack?.name || '読み込み中...'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-riso-coral/10 border border-riso-coral/30 text-riso-coral rounded">
            {error}
          </div>
        )}

        {/* チーム選択 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 赤チーム */}
          <div className="card bg-riso-coral/10 border-2 border-riso-coral/30">
            <h2 className="text-xl font-bold text-riso-coral mb-4">🔴 赤チーム</h2>

            {/* スパイマスター */}
            <div className="mb-4">
              <h3 className="font-semibold text-sm text-riso-navy mb-2">👑 スパイマスター</h3>
              {redSpymaster ? (
                <div className="p-2 bg-white rounded border border-riso-coral/20">
                  {redSpymaster.nickname}
                  {redSpymaster.id === currentPlayer?.id && ' (あなた)'}
                </div>
              ) : (
                <div className="p-2 bg-paper-warm rounded text-neutral-muted text-sm">
                  (空き)
                </div>
              )}
            </div>

            {/* オペレーティブ */}
            <div className="mb-4">
              <h3 className="font-semibold text-sm text-riso-navy mb-2">🔍 オペレーティブ</h3>
              {redOperatives.length > 0 ? (
                <div className="space-y-1">
                  {redOperatives.map((p) => (
                    <div key={p.id} className="p-2 bg-white rounded border border-riso-coral/20 text-sm">
                      {p.nickname}
                      {p.id === currentPlayer?.id && ' (あなた)'}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2 bg-paper-warm rounded text-neutral-muted text-sm">
                  (なし)
                </div>
              )}
            </div>

            {/* 選択ボタン */}
            {currentPlayer && (
              <div className="space-y-2">
                <button
                  onClick={() => handleTeamAndRoleChange(Team.RED, PlayerRole.SPYMASTER)}
                  disabled={!!redSpymaster && redSpymaster.id !== currentPlayer.id}
                  className="btn-secondary w-full text-sm disabled:opacity-50"
                >
                  スパイマスターになる
                </button>
                <button
                  onClick={() => handleTeamAndRoleChange(Team.RED, PlayerRole.OPERATIVE)}
                  className="btn-secondary w-full text-sm"
                >
                  オペレーティブになる
                </button>
              </div>
            )}
          </div>

          {/* 青チーム */}
          <div className="card bg-riso-teal/10 border-2 border-riso-teal/30">
            <h2 className="text-xl font-bold text-riso-teal mb-4">🔵 青チーム</h2>

            {/* スパイマスター */}
            <div className="mb-4">
              <h3 className="font-semibold text-sm text-riso-navy mb-2">👑 スパイマスター</h3>
              {blueSpymaster ? (
                <div className="p-2 bg-white rounded border border-riso-teal/20">
                  {blueSpymaster.nickname}
                  {blueSpymaster.id === currentPlayer?.id && ' (あなた)'}
                </div>
              ) : (
                <div className="p-2 bg-paper-warm rounded text-neutral-muted text-sm">
                  (空き)
                </div>
              )}
            </div>

            {/* オペレーティブ */}
            <div className="mb-4">
              <h3 className="font-semibold text-sm text-riso-navy mb-2">🔍 オペレーティブ</h3>
              {blueOperatives.length > 0 ? (
                <div className="space-y-1">
                  {blueOperatives.map((p) => (
                    <div key={p.id} className="p-2 bg-white rounded border border-riso-teal/20 text-sm">
                      {p.nickname}
                      {p.id === currentPlayer?.id && ' (あなた)'}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2 bg-paper-warm rounded text-neutral-muted text-sm">
                  (なし)
                </div>
              )}
            </div>

            {/* 選択ボタン */}
            {currentPlayer && (
              <div className="space-y-2">
                <button
                  onClick={() => handleTeamAndRoleChange(Team.BLUE, PlayerRole.SPYMASTER)}
                  disabled={!!blueSpymaster && blueSpymaster.id !== currentPlayer.id}
                  className="btn-secondary w-full text-sm disabled:opacity-50"
                >
                  スパイマスターになる
                </button>
                <button
                  onClick={() => handleTeamAndRoleChange(Team.BLUE, PlayerRole.OPERATIVE)}
                  className="btn-secondary w-full text-sm"
                >
                  オペレーティブになる
                </button>
              </div>
            )}
          </div>

          {/* 観戦者 */}
          <div className="card bg-paper-cream border-2 border-neutral-soft">
            <h2 className="text-xl font-bold text-riso-navy mb-4">👁 観戦者</h2>
            {spectators.length > 0 ? (
              <div className="space-y-1 mb-4">
                {spectators.map((p) => (
                  <div key={p.id} className="p-2 bg-white rounded border border-neutral-soft text-sm">
                    {p.nickname}
                    {p.id === currentPlayer?.id && ' (あなた)'}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 bg-paper-warm rounded text-neutral-muted text-sm mb-4">
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
          <div className="card bg-riso-mustard/10 border-2 border-riso-mustard/30">
            <button
              onClick={handleStartGame}
              disabled={!canStartGame()}
              className="btn-primary w-full text-lg py-4 disabled:bg-neutral-warm"
            >
              🎮 ゲームを開始する
            </button>
            {!canStartGame() && (
              <p className="text-sm text-riso-coral mt-2 text-center">
                各チームに1人以上のプレイヤーとスパイマスターが必要です
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

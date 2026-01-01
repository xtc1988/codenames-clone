import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRoomByCode, updatePlayer } from '@/services/roomService';
import { addAISpymaster, removeAISpymaster } from '@/services/aiService';
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
  const [aiLoading, setAiLoading] = useState<Team | null>(null);

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
      setError('ルーム情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [code, setRoom, setPlayers]);

  const { broadcast } = useRealtime({
    roomCode: code || '',
    onPlayerUpdated: useCallback(() => { loadRoom(); }, [loadRoom]),
    onGameStarted: useCallback(() => { navigate(`/room/${code}/game`); }, [navigate, code]),
  });

  useEffect(() => {
    if (!code) {
      setError('ルームコードが指定されていません');
      setLoading(false);
      return;
    }
    loadRoom();
  }, [code, loadRoom]);

  const handleTeamChange = async (team: Team) => {
    if (!currentPlayer || !code) return;
    try {
      const updated = await updatePlayer({
        playerId: currentPlayer.id,
        team,
        role: team === Team.SPECTATOR ? null : currentPlayer.role,
      });
      setCurrentPlayer(updated);
      const existingPlayer = players.find((p: Player) => p.id === updated.id);
      if (existingPlayer) {
        updatePlayerInStore(updated.id, updated);
      } else {
        addPlayer(updated);
      }
      loadRoom();
      await broadcast('player_updated', updated);
    } catch (err) {
      setError('チーム変更に失敗しました');
    }
  };

  const handleTeamAndRoleChange = async (team: Team, role: PlayerRole | null) => {
    if (!currentPlayer || !code) return;
    try {
      const updated = await updatePlayer({
        playerId: currentPlayer.id,
        team,
        role: team === Team.SPECTATOR ? null : role,
      });
      setCurrentPlayer(updated);
      const existingPlayer = players.find((p: Player) => p.id === updated.id);
      if (existingPlayer) {
        updatePlayerInStore(updated.id, updated);
      } else {
        addPlayer(updated);
      }
      loadRoom();
      await broadcast('player_updated', updated);
    } catch (err) {
      setError('チーム・役割変更に失敗しました');
    }
  };

  const handleAddAISpymaster = async (team: Team) => {
    if (!room || !code) return;
    setAiLoading(team);
    setError('');
    try {
      const aiPlayer = await addAISpymaster(room.id, team);
      addPlayer(aiPlayer);
      await broadcast('player_updated', aiPlayer);
      await loadRoom();
    } catch (err) {
      setError('AIスパイマスターの追加に失敗しました');
    } finally {
      setAiLoading(null);
    }
  };

  const handleRemoveAISpymaster = async (playerId: string) => {
    if (!code) return;
    setError('');
    try {
      await removeAISpymaster(playerId);
      await loadRoom();
      await broadcast('player_updated', { id: playerId, removed: true });
    } catch (err) {
      setError('AIスパイマスターの削除に失敗しました');
    }
  };

  const canStartGame = (): boolean => {
    if (!currentPlayer?.isHost) return false;
    const redPlayers = players.filter((p) => p.team === Team.RED);
    const bluePlayers = players.filter((p) => p.team === Team.BLUE);
    const redSpymaster = redPlayers.find((p) => p.role === PlayerRole.SPYMASTER);
    const blueSpymaster = bluePlayers.find((p) => p.role === PlayerRole.SPYMASTER);
    return redPlayers.length >= 1 && bluePlayers.length >= 1 && !!redSpymaster && !!blueSpymaster;
  };

  const handleStartGame = async () => {
    if (!canStartGame() || !code || !room) {
      setError('ゲームを開始できません。各チームに1人以上のプレイヤーとスパイマスターが必要です。');
      return;
    }
    try {
      const { startGame } = await import('@/services/gameService');
      await startGame(room.id, room.wordPackId);
      await broadcast('game_started', { roomCode: code, timestamp: new Date().toISOString() });
      navigate(`/room/${code}/game`);
    } catch (err) {
      setError('ゲームの開始に失敗しました');
    }
  };

  const redPlayers = players.filter((p) => p.team === Team.RED);
  const bluePlayers = players.filter((p) => p.team === Team.BLUE);
  const spectators = players.filter((p) => p.team === Team.SPECTATOR);
  const redSpymaster = redPlayers.find((p) => p.role === PlayerRole.SPYMASTER);
  const blueSpymaster = bluePlayers.find((p) => p.role === PlayerRole.SPYMASTER);
  const redOperatives = redPlayers.filter((p) => p.role === PlayerRole.OPERATIVE);
  const blueOperatives = bluePlayers.filter((p) => p.role === PlayerRole.OPERATIVE);
  const isAI = (player: Player | undefined) => player?.isAI === true;

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
          <p className="text-team-berry mb-4">{error}</p>
          <Link to="/" className="btn-primary inline-block">トップに戻る</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-forest-bg">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="text-team-sky hover:underline text-sm">← トップに戻る</Link>
          <div className="flex items-center gap-4">
            <div className="text-sm text-neutral-muted">
              ルームコード:
              <span className="ml-2 px-3 py-1 bg-team-sky/20 text-team-sky-dark font-mono rounded">{room?.code}</span>
            </div>
            <button onClick={loadRoom} className="btn-secondary text-sm px-3 py-1">更新</button>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">{room?.name}</h1>
        <p className="text-neutral-muted mb-6">単語パック: {room?.wordPack?.name || '読み込み中...'}</p>

        {error && (
          <div className="mb-4 p-3 bg-team-berry/10 border border-team-berry/30 text-team-berry rounded">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Berry Team */}
          <div className="card bg-team-berry/10 border-2 border-team-berry/30">
            <h2 className="text-xl font-bold text-team-berry mb-4">Berry Team</h2>
            <div className="mb-4">
              <h3 className="font-semibold text-sm text-forest-bark mb-2">Spymaster</h3>
              {redSpymaster ? (
                <div className="p-2 bg-white rounded border border-team-berry/20 flex items-center justify-between">
                  <span>
                    {isAI(redSpymaster) && <span className="mr-1">🤖</span>}
                    {redSpymaster.nickname}
                    {redSpymaster.id === currentPlayer?.id && ' (あなた)'}
                  </span>
                  {isAI(redSpymaster) && currentPlayer?.isHost && (
                    <button onClick={() => handleRemoveAISpymaster(redSpymaster.id)} className="text-team-berry text-xs hover:underline">削除</button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-2 bg-forest-cream rounded text-neutral-muted text-sm">(空き)</div>
                  {currentPlayer?.isHost && (
                    <button
                      onClick={() => handleAddAISpymaster(Team.RED)}
                      disabled={aiLoading === Team.RED}
                      className="w-full text-sm py-2 px-3 bg-forest-primary/10 text-forest-primary border border-forest-primary/30 rounded hover:bg-forest-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {aiLoading === Team.RED ? '読み込み中...' : '🤖 AIスパイマスターを追加'}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="mb-4">
              <h3 className="font-semibold text-sm text-forest-bark mb-2">Operatives</h3>
              {redOperatives.length > 0 ? (
                <div className="space-y-1">
                  {redOperatives.map((p) => (
                    <div key={p.id} className="p-2 bg-white rounded border border-team-berry/20 text-sm">
                      {p.nickname}{p.id === currentPlayer?.id && ' (あなた)'}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2 bg-forest-cream rounded text-neutral-muted text-sm">(なし)</div>
              )}
            </div>
            {currentPlayer && (
              <div className="space-y-2">
                <button
                  onClick={() => handleTeamAndRoleChange(Team.RED, PlayerRole.SPYMASTER)}
                  disabled={(!!redSpymaster && redSpymaster.id !== currentPlayer.id) || isAI(redSpymaster)}
                  className="btn-secondary w-full text-sm disabled:opacity-50"
                >スパイマスターになる</button>
                <button onClick={() => handleTeamAndRoleChange(Team.RED, PlayerRole.OPERATIVE)} className="btn-secondary w-full text-sm">オペレーティブになる</button>
              </div>
            )}
          </div>

          {/* Sky Team */}
          <div className="card bg-team-sky/10 border-2 border-team-sky/30">
            <h2 className="text-xl font-bold text-team-sky mb-4">Sky Team</h2>
            <div className="mb-4">
              <h3 className="font-semibold text-sm text-forest-bark mb-2">Spymaster</h3>
              {blueSpymaster ? (
                <div className="p-2 bg-white rounded border border-team-sky/20 flex items-center justify-between">
                  <span>
                    {isAI(blueSpymaster) && <span className="mr-1">🤖</span>}
                    {blueSpymaster.nickname}
                    {blueSpymaster.id === currentPlayer?.id && ' (あなた)'}
                  </span>
                  {isAI(blueSpymaster) && currentPlayer?.isHost && (
                    <button onClick={() => handleRemoveAISpymaster(blueSpymaster.id)} className="text-team-sky text-xs hover:underline">削除</button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-2 bg-forest-cream rounded text-neutral-muted text-sm">(空き)</div>
                  {currentPlayer?.isHost && (
                    <button
                      onClick={() => handleAddAISpymaster(Team.BLUE)}
                      disabled={aiLoading === Team.BLUE}
                      className="w-full text-sm py-2 px-3 bg-forest-primary/10 text-forest-primary border border-forest-primary/30 rounded hover:bg-forest-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {aiLoading === Team.BLUE ? '読み込み中...' : '🤖 AIスパイマスターを追加'}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="mb-4">
              <h3 className="font-semibold text-sm text-forest-bark mb-2">Operatives</h3>
              {blueOperatives.length > 0 ? (
                <div className="space-y-1">
                  {blueOperatives.map((p) => (
                    <div key={p.id} className="p-2 bg-white rounded border border-team-sky/20 text-sm">
                      {p.nickname}{p.id === currentPlayer?.id && ' (あなた)'}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2 bg-forest-cream rounded text-neutral-muted text-sm">(なし)</div>
              )}
            </div>
            {currentPlayer && (
              <div className="space-y-2">
                <button
                  onClick={() => handleTeamAndRoleChange(Team.BLUE, PlayerRole.SPYMASTER)}
                  disabled={(!!blueSpymaster && blueSpymaster.id !== currentPlayer.id) || isAI(blueSpymaster)}
                  className="btn-secondary w-full text-sm disabled:opacity-50"
                >スパイマスターになる</button>
                <button onClick={() => handleTeamAndRoleChange(Team.BLUE, PlayerRole.OPERATIVE)} className="btn-secondary w-full text-sm">オペレーティブになる</button>
              </div>
            )}
          </div>

          {/* Spectators */}
          <div className="card bg-forest-bg border-2 border-neutral-soft">
            <h2 className="text-xl font-bold text-forest-bark mb-4">Spectators</h2>
            {spectators.length > 0 ? (
              <div className="space-y-1 mb-4">
                {spectators.map((p) => (
                  <div key={p.id} className="p-2 bg-white rounded border border-neutral-soft text-sm">
                    {p.nickname}{p.id === currentPlayer?.id && ' (あなた)'}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 bg-forest-cream rounded text-neutral-muted text-sm mb-4">(なし)</div>
            )}
            {currentPlayer && (
              <button onClick={() => handleTeamChange(Team.SPECTATOR)} className="btn-secondary w-full text-sm">観戦者になる</button>
            )}
          </div>
        </div>

        {currentPlayer?.isHost && (
          <div className="card bg-forest-moss/10 border-2 border-forest-moss/30">
            <button onClick={handleStartGame} disabled={!canStartGame()} className="btn-primary w-full text-lg py-4 disabled:bg-neutral-warm">
              ゲームを開始する
            </button>
            {!canStartGame() && (
              <p className="text-sm text-team-berry mt-2 text-center">各チームに1人以上のプレイヤーとスパイマスターが必要です</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

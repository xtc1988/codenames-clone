import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getRoomByCode, joinRoom } from '@/services/roomService';
import { usePlayerStore } from '@/stores/playerStore';
import { useRoomStore } from '@/stores/roomStore';

export default function JoinRoomPage() {
  const navigate = useNavigate();
  const setCurrentPlayer = usePlayerStore((state) => state.setCurrentPlayer);
  const setRoom = useRoomStore((state) => state.setRoom);
  const setPlayers = useRoomStore((state) => state.setPlayers);

  const [roomCode, setRoomCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!roomCode.trim()) {
      setError('ルームコードを入力してください');
      return;
    }

    if (!nickname.trim()) {
      setError('ニックネームを入力してください');
      return;
    }

    setLoading(true);

    try {
      // ルーム存在確認
      const room = await getRoomByCode(roomCode.trim());

      if (!room) {
        setError('ルームが見つかりません。コードを確認してください。');
        setLoading(false);
        return;
      }

      // ルームに参加
      const player = await joinRoom({
        roomId: room.id,
        nickname: nickname.trim(),
      });

      // ストアに保存
      setRoom(room);
      setPlayers(room.players || []);
      setCurrentPlayer(player);

      // ロビーへ遷移
      navigate(`/room/${room.code}`);
    } catch (err) {
      console.error('[JoinRoomPage] エラー:', err);
      setError(
        err instanceof Error ? err.message : 'ルームへの参加に失敗しました'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full card">
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:underline text-sm">
            ← トップに戻る
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">ルームに参加</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ルームコード */}
          <div>
            <label htmlFor="roomCode" className="label">
              ルームコード
            </label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="input-field text-center text-2xl tracking-widest font-mono"
              placeholder="ABC123"
              maxLength={6}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              6桁の英数字を入力してください
            </p>
          </div>

          {/* ニックネーム */}
          <div>
            <label htmlFor="nickname" className="label">
              あなたのニックネーム
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="input-field"
              placeholder="太郎"
              maxLength={50}
              required
            />
          </div>

          {/* 参加ボタン */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-lg py-3"
          >
            {loading ? '参加中...' : 'ルームに参加'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            または
            <Link to="/rooms" className="text-blue-600 hover:underline ml-1">
              公開ルーム一覧から選ぶ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

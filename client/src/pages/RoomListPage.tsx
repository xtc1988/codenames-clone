import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPublicRooms } from '@/services/roomService';
import { RoomListItem } from '@/types';

export default function RoomListPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ルーム一覧取得
  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    setLoading(true);
    setError('');

    try {
      const roomList = await getPublicRooms();
      setRooms(roomList);
    } catch (err) {
      console.error('[RoomListPage] エラー:', err);
      setError('ルーム一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  const handleJoinRoom = (code: string) => {
    navigate(`/join?code=${code}`);
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="text-blue-600 hover:underline text-sm">
            ← トップに戻る
          </Link>
          <button
            onClick={loadRooms}
            className="btn-secondary text-sm px-3 py-1"
            disabled={loading}
          >
            🔄 更新
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-6">公開ルーム一覧</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">
              現在、参加可能な公開ルームはありません
            </p>
            <Link to="/create" className="btn-primary inline-block">
              ルームを作成する
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleJoinRoom(room.code)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold">{room.name}</h2>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-mono rounded">
                        {room.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        👥 {room.playerCount}/{room.maxPlayers}人
                      </span>
                      <span>
                        ⏱ {new Date(room.createdAt).toLocaleString('ja-JP')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <button
                      className="btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinRoom(room.code);
                      }}
                    >
                      参加する
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/join" className="text-blue-600 hover:underline">
            ルームコードで参加する →
          </Link>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createRoom, getWordPacks } from '@/services/roomService';
import { usePlayerStore } from '@/stores/playerStore';
import { useRoomStore } from '@/stores/roomStore';
import { WordPack } from '@/types';

export default function CreateRoomPage() {
  const navigate = useNavigate();
  const setCurrentPlayer = usePlayerStore((state) => state.setCurrentPlayer);
  const setRoom = useRoomStore((state) => state.setRoom);

  const [roomName, setRoomName] = useState('');
  const [nickname, setNickname] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [wordPackId, setWordPackId] = useState('');
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [wordPacks, setWordPacks] = useState<WordPack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 単語パック一覧取得
  useEffect(() => {
    async function loadWordPacks() {
      const packs = await getWordPacks();
      setWordPacks(packs);
      // デフォルトパックを選択
      const defaultPack = packs.find((p) => p.isDefault);
      if (defaultPack) {
        setWordPackId(defaultPack.id);
      }
    }
    loadWordPacks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!roomName.trim()) {
      setError('ルーム名を入力してください');
      return;
    }

    if (!nickname.trim()) {
      setError('ニックネームを入力してください');
      return;
    }

    if (!wordPackId) {
      setError('単語パックを選択してください');
      return;
    }

    setLoading(true);

    try {
      const result = await createRoom({
        roomName: roomName.trim(),
        hostNickname: nickname.trim(),
        wordPackId,
        isPublic,
        timerSeconds: timerEnabled ? timerSeconds : null,
      });

      // ストアに保存
      setRoom(result.room);
      setCurrentPlayer(result.player);

      // ロビーへ遷移
      navigate(`/room/${result.room.code}`);
    } catch (err) {
      console.error('[CreateRoomPage] エラー:', err);
      setError(
        err instanceof Error ? err.message : 'ルームの作成に失敗しました'
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

        <h1 className="text-2xl font-bold mb-6">ルームを作成</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ルーム名 */}
          <div>
            <label htmlFor="roomName" className="label">
              ルーム名
            </label>
            <input
              id="roomName"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="input-field"
              placeholder="友達とコードネーム"
              maxLength={100}
              required
            />
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

          {/* 単語パック */}
          <div>
            <label htmlFor="wordPack" className="label">
              単語パック
            </label>
            <select
              id="wordPack"
              value={wordPackId}
              onChange={(e) => setWordPackId(e.target.value)}
              className="input-field"
              required
            >
              <option value="">選択してください</option>
              {wordPacks.map((pack) => (
                <option key={pack.id} value={pack.id}>
                  {pack.name}
                  {pack.isDefault && ' (デフォルト)'}
                </option>
              ))}
            </select>
          </div>

          {/* 公開設定 */}
          <div className="flex items-center">
            <input
              id="isPublic"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mr-2 h-4 w-4"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              公開ルームにする（一覧に表示されます）
            </label>
          </div>

          {/* タイマー設定 */}
          <div>
            <div className="flex items-center mb-2">
              <input
                id="timerEnabled"
                type="checkbox"
                checked={timerEnabled}
                onChange={(e) => setTimerEnabled(e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              <label htmlFor="timerEnabled" className="text-sm text-gray-700">
                ターンタイマーを有効にする
              </label>
            </div>

            {timerEnabled && (
              <div className="ml-6">
                <label htmlFor="timerSeconds" className="label">
                  制限時間（秒）
                </label>
                <input
                  id="timerSeconds"
                  type="number"
                  value={timerSeconds}
                  onChange={(e) => setTimerSeconds(Number(e.target.value))}
                  className="input-field"
                  min={10}
                  max={300}
                  step={10}
                />
              </div>
            )}
          </div>

          {/* 作成ボタン */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-lg py-3"
          >
            {loading ? '作成中...' : 'ルームを作成'}
          </button>
        </form>
      </div>
    </div>
  );
}

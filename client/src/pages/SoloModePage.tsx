import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, updatePlayer, getWordPacks } from '@/services/roomService';
import { addAISpymaster } from '@/services/aiService';
import { startGame } from '@/services/gameService';
import { usePlayerStore } from '@/stores/playerStore';
import { Team, WordPack } from '@/types';

export default function SoloModePage() {
  const navigate = useNavigate();
  const setCurrentPlayer = usePlayerStore((state) => state.setCurrentPlayer);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [defaultWordPack, setDefaultWordPack] = useState<WordPack | null>(null);
  const [wordPackLoading, setWordPackLoading] = useState(true);

  // デフォルト単語パックを取得
  useEffect(() => {
    async function loadWordPacks() {
      setWordPackLoading(true);
      try {
        console.log('[SoloModePage] 単語パック取得開始');
        const packs = await getWordPacks();
        console.log('[SoloModePage] 取得結果:', packs.length, '件');
        if (packs.length === 0) {
          setError('単語パックが見つかりません。管理画面で単語パックを作成してください。');
          return;
        }
        const defaultPack = packs.find((p) => p.isDefault) || packs[0];
        console.log('[SoloModePage] 選択されたパック:', defaultPack?.name);
        setDefaultWordPack(defaultPack || null);
      } catch (err) {
        console.error('[SoloModePage] 単語パック取得エラー:', err);
        setError('単語パックの取得に失敗しました。');
      } finally {
        setWordPackLoading(false);
      }
    }
    loadWordPacks();
  }, []);

  const handleStartSoloGame = async () => {
    if (!nickname.trim()) {
      setError('ニックネームを入力してください');
      return;
    }

    if (!defaultWordPack) {
      setError('単語パックの読み込みに失敗しました');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: ルーム作成
      setStatus('ルームを作成中...');
      const { room, player } = await createRoom({
        roomName: `${nickname}の1人プレイ`,
        hostNickname: nickname.trim(),
        wordPackId: defaultWordPack.id,
        isPublic: false,
        timerSeconds: null,
      });

      // Step 2: 自分をBerryチーム(赤)のオペレーティブに設定
      setStatus('プレイヤーを設定中...');
      const updatedPlayer = await updatePlayer({
        playerId: player.id,
        team: 'red',
        role: 'operative',
      });
      setCurrentPlayer(updatedPlayer);

      // Step 3: 赤チームにAIスパイマスター追加
      setStatus('AIスパイマスターを追加中...');
      await addAISpymaster(room.id, Team.RED);

      // Step 4: 青チームにもAIスパイマスター追加（自動プレイ用）
      await addAISpymaster(room.id, Team.BLUE);

      // Step 5: ゲーム開始
      setStatus('ゲームを開始中...');
      await startGame(room.id, defaultWordPack.id);

      // ゲームページへ遷移
      navigate(`/room/${room.code}/game`);
    } catch (err) {
      console.error('[SoloModePage] ゲーム開始エラー:', err);
      const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました';
      setError(`ゲーム開始に失敗しました: ${errorMessage}`);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-forest-bg">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-forest-bark mb-2">🤖 1人モード</h1>
          <p className="text-neutral-muted">AIスパイマスターと一緒にプレイ</p>
        </div>

        <div className="card">
          <div className="space-y-4">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-forest-bark mb-1">
                ニックネーム
              </label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="あなたの名前"
                className="input-field w-full"
                maxLength={20}
                disabled={loading}
                onKeyDown={(e) => e.key === 'Enter' && handleStartSoloGame()}
              />
            </div>

            {error && (
              <div className="p-3 bg-team-berry/10 border border-rose-500/30 text-team-berry rounded text-sm">
                {error}
              </div>
            )}

            {status && (
              <div className="p-3 bg-forest-primary/10 border border-forest-primary/30 text-forest-primary rounded text-sm flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-forest-primary border-t-transparent"></div>
                {status}
              </div>
            )}

            <button
              onClick={handleStartSoloGame}
              disabled={loading || !nickname.trim() || wordPackLoading || !defaultWordPack}
              className="btn-primary w-full text-lg py-3 disabled:opacity-50"
            >
              {wordPackLoading ? '読み込み中...' : loading ? '準備中...' : 'ゲーム開始'}
            </button>
          </div>

          <div className="mt-6 p-4 bg-forest-moss/10 rounded-lg">
            <h3 className="font-bold text-forest-bark mb-2">遊び方</h3>
            <ul className="text-sm text-neutral-muted space-y-1">
              <li>• あなたはBerryチーム（赤）のオペレーティブです</li>
              <li>• AIスパイマスターがヒントを出します</li>
              <li>• ヒントを元にカードを選んでください</li>
              <li>• 相手チームのターンは自動でスキップされます</li>
              <li>• 先に全てのカードを見つければ勝利！</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-forest-primary hover:underline"
          >
            ← トップに戻る
          </button>
        </div>
      </div>
    </div>
  );
}

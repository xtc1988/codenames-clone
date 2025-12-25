import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllWordPacks,
  deleteWordPack,
  WordPack,
} from '@/services/wordPackService';
import { getSessionId } from '@/services/roomService';

export default function WordPackListPage() {
  const [packs, setPacks] = useState<WordPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const sessionId = getSessionId();

  useEffect(() => {
    loadPacks();
  }, []);

  async function loadPacks() {
    setLoading(true);
    setError('');

    try {
      const data = await getAllWordPacks();
      setPacks(data);
    } catch (err) {
      console.error('[WordPackListPage] エラー:', err);
      setError('単語パックの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (packId: string, packName: string) => {
    if (!confirm(`「${packName}」を削除してもよろしいですか？`)) {
      return;
    }

    try {
      await deleteWordPack(packId);
      await loadPacks();
    } catch (err) {
      console.error('[WordPackListPage] 削除エラー:', err);
      setError('単語パックの削除に失敗しました');
    }
  };

  const isOwner = (pack: WordPack) => {
    return pack.creatorSessionId === sessionId && !pack.isDefault;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
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
          <button onClick={loadPacks} className="btn-secondary text-sm px-3 py-1">
            🔄 更新
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-6">単語パック管理</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* 新規作成ボタン */}
        <div className="mb-6">
          <Link to="/word-packs/create" className="btn-primary inline-block">
            ✨ 新規作成
          </Link>
        </div>

        {/* パック一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className={`card ${
                pack.isDefault ? 'border-2 border-green-500' : ''
              }`}
            >
              {/* デフォルトバッジ */}
              {pack.isDefault && (
                <div className="mb-2">
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">
                    デフォルト
                  </span>
                </div>
              )}

              {/* パック名 */}
              <h3 className="text-lg font-bold mb-2">{pack.name}</h3>

              {/* 説明 */}
              {pack.description && (
                <p className="text-sm text-gray-600 mb-3">{pack.description}</p>
              )}

              {/* 情報 */}
              <div className="text-sm text-gray-500 mb-4">
                <p>単語数: {pack.wordCount}語</p>
                <p>言語: {pack.language === 'ja' ? '日本語' : pack.language}</p>
                <p>{pack.isPublic ? '🌍 公開' : '🔒 非公開'}</p>
              </div>

              {/* アクション */}
              <div className="flex gap-2">
                {isOwner(pack) ? (
                  <>
                    <Link
                      to={`/word-packs/${pack.id}/edit`}
                      className="btn-secondary flex-1 text-center text-sm"
                    >
                      ✏️ 編集
                    </Link>
                    <button
                      onClick={() => handleDelete(pack.id, pack.name)}
                      className="btn-secondary flex-1 text-sm bg-red-100 hover:bg-red-200"
                    >
                      🗑️ 削除
                    </button>
                  </>
                ) : (
                  <div className="flex-1 text-center text-xs text-gray-500">
                    {pack.isDefault
                      ? 'システムパック'
                      : '他のユーザーが作成'}
                  </div>
                )}
              </div>
            </div>
          ))}

          {packs.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              単語パックがありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

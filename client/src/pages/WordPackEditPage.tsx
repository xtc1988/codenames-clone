import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  getWordPackById,
  updateWordPack,
  addWords,
  deleteWord,
  WordPackDetail,
} from '@/services/wordPackService';

export default function WordPackEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pack, setPack] = useState<WordPackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [newWordsText, setNewWordsText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadPack();
    }
  }, [id]);

  async function loadPack() {
    if (!id) return;

    setLoading(true);
    setError('');

    try {
      const data = await getWordPackById(id);
      setPack(data);
      setName(data.name);
      setDescription(data.description || '');
      setIsPublic(data.isPublic);
    } catch (err) {
      console.error('[WordPackEditPage] 読み込みエラー:', err);
      setError('単語パックの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !pack) return;

    setSubmitting(true);
    setError('');

    try {
      // パック情報更新
      await updateWordPack(id, {
        name: name.trim(),
        description: description.trim(),
        isPublic,
      });

      // 新規単語追加
      if (newWordsText.trim()) {
        const newWords = newWordsText
          .split('\n')
          .map((w) => w.trim())
          .filter((w) => w.length > 0);

        if (newWords.length > 0) {
          await addWords(id, newWords);
        }
      }

      console.log('[WordPackEditPage] 更新成功');
      navigate('/word-packs');
    } catch (err) {
      console.error('[WordPackEditPage] 更新エラー:', err);
      setError('単語パックの更新に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWord = async (wordId: string) => {
    if (!pack) return;

    if (pack.words.length <= 25) {
      alert('最低25個の単語が必要です。これ以上削除できません。');
      return;
    }

    if (!confirm('この単語を削除してもよろしいですか？')) {
      return;
    }

    try {
      await deleteWord(wordId);
      await loadPack(); // 再読み込み
    } catch (err) {
      console.error('[WordPackEditPage] 単語削除エラー:', err);
      setError('単語の削除に失敗しました');
    }
  };

  const newWordCount = newWordsText
    .split('\n')
    .map((w) => w.trim())
    .filter((w) => w.length > 0).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error && !pack) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/word-packs" className="btn-primary inline-block">
            単語パック一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">単語パックが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <Link to="/word-packs" className="text-blue-600 hover:underline text-sm">
            ← 単語パック一覧に戻る
          </Link>
        </div>

        <div className="card">
          <h1 className="text-2xl font-bold mb-6">単語パックを編集</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleUpdate}>
            {/* パック名 */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                パック名 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field w-full"
                maxLength={100}
                required
              />
            </div>

            {/* 説明 */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">説明</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field w-full"
                rows={3}
                maxLength={500}
              />
            </div>

            {/* 公開設定 */}
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold">
                  このパックを公開する（他のユーザーも使用できます）
                </span>
              </label>
            </div>

            {/* 既存の単語一覧 */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                既存の単語（{pack.words.length}個）
              </label>
              <div className="max-h-64 overflow-y-auto border border-gray-300 rounded p-2 bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {pack.words.map((word) => (
                    <div
                      key={word.id}
                      className="flex items-center justify-between bg-white rounded px-2 py-1 text-sm"
                    >
                      <span>{word.word}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteWord(word.id)}
                        className="text-red-600 hover:text-red-800 ml-2"
                        title="削除"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 新規単語追加 */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                新しい単語を追加
                <span className="ml-2 text-xs text-gray-500">
                  （1行に1単語）
                </span>
              </label>
              <textarea
                value={newWordsText}
                onChange={(e) => setNewWordsText(e.target.value)}
                placeholder="追加する単語を入力してください（改行区切り）"
                className="input-field w-full font-mono"
                rows={6}
              />
              {newWordCount > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  追加予定: <span className="font-bold">{newWordCount}</span> 個
                </p>
              )}
            </div>

            {/* ボタン */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1 disabled:bg-gray-400"
              >
                {submitting ? '保存中...' : '保存する'}
              </button>
              <Link
                to="/word-packs"
                className="btn-secondary flex-1 text-center"
              >
                キャンセル
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

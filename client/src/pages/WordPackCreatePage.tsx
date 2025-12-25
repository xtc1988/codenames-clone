import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createWordPack } from '@/services/wordPackService';

export default function WordPackCreatePage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [wordsText, setWordsText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('パック名を入力してください');
      return;
    }

    // 単語を改行で分割して配列にする
    const words = wordsText
      .split('\n')
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    if (words.length < 25) {
      setError('最低25個の単語が必要です');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const pack = await createWordPack({
        name: name.trim(),
        description: description.trim(),
        isPublic,
        language: 'ja',
        words,
      });

      console.log('[WordPackCreatePage] 作成成功:', pack);
      navigate('/word-packs');
    } catch (err) {
      console.error('[WordPackCreatePage] 作成エラー:', err);
      setError('単語パックの作成に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const wordCount = wordsText
    .split('\n')
    .map((w) => w.trim())
    .filter((w) => w.length > 0).length;

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <Link to="/word-packs" className="text-blue-600 hover:underline text-sm">
            ← 単語パック一覧に戻る
          </Link>
        </div>

        <div className="card">
          <h1 className="text-2xl font-bold mb-6">単語パックを作成</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* パック名 */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                パック名 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: アニメ用語パック"
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
                placeholder="このパックについての説明を入力してください"
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

            {/* 単語入力 */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                単語リスト <span className="text-red-600">*</span>
                <span className="ml-2 text-xs text-gray-500">
                  （1行に1単語、最低25個必要）
                </span>
              </label>
              <textarea
                value={wordsText}
                onChange={(e) => setWordsText(e.target.value)}
                placeholder="りんご&#10;バナナ&#10;オレンジ&#10;..."
                className="input-field w-full font-mono"
                rows={12}
                required
              />
              <p className="mt-2 text-sm text-gray-600">
                現在の単語数: <span className="font-bold">{wordCount}</span> 個
                {wordCount < 25 && (
                  <span className="text-red-600 ml-2">
                    （あと {25 - wordCount} 個必要）
                  </span>
                )}
              </p>
            </div>

            {/* ボタン */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting || wordCount < 25}
                className="btn-primary flex-1 disabled:bg-gray-400"
              >
                {submitting ? '作成中...' : '作成する'}
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
